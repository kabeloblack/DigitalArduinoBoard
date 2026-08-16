import {
  CPU,
  avrInstruction,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  AVRTimer,
  timer0Config,
  timer1Config,
  timer2Config,
  AVRUSART,
  usart0Config,
  AVRADC,
  adcConfig,
} from "avr8js";
import { CircuitBlueprint, SimulationState, LiveComponentState } from "../types/circuit";
import { audioEngine } from "./arduinoSimulator";
import { buildNetResolver, NetResolver, SWITCH_TOPOLOGY } from "./circuitNet";
import { Hd44780Decoder, LCD_PIN_ROLES, getLcdDimensions } from "./hd44780";
import { Ws2812Decoder, getNeoPixelCount } from "./ws2812";

export interface CpuRegisters {
  r: number[]; // R0 - R31
  pc: number;
  sp: number;
  sreg: {
    c: boolean;
    z: boolean;
    n: boolean;
    v: boolean;
    s: boolean;
    h: boolean;
    t: boolean;
    i: boolean;
  };
  cycles: number;
  frequencyMhz: number;
}

// avr8js's bundled Timer0/1/2 configs bake in ATmega328P's specific interrupt vector
// numbers (not just register addresses). Re-deriving correct vector numbers for other
// AVR chips (e.g. ATmega2560's much longer vector table) was tested empirically against
// real AVR-GCC-compiled firmware and reliably corrupted CPU execution instead of running
// delay()/millis() correctly - so this engine only claims support for ATmega328P
// (Arduino Uno/Nano), which is the one profile verified to work end-to-end. Other AVR
// boards (Mega, Franzininho/ATtiny85) and ESP32 run on the architecture-agnostic
// ArduinoInterpreter instead (see App.tsx).
export class AVR8jsSimulator {
  private blueprint: CircuitBlueprint;
  private state: SimulationState;
  private onStateChange: (state: SimulationState) => void;
  private onRegistersChange?: (regs: CpuRegisters) => void;
  private boardId: string;
  private netResolver: NetResolver;
  private closedSwitches = new Set<string>();
  private lcdDecoders = new Map<string, Hd44780Decoder>();
  private neoPixelDecoders = new Map<string, Ws2812Decoder>();

  private cpu: CPU | null = null;
  private portB: AVRIOPort | null = null;
  private portC: AVRIOPort | null = null;
  private portD: AVRIOPort | null = null;
  private usart: AVRUSART | null = null;
  private timer0: AVRTimer | null = null;
  private timer1: AVRTimer | null = null;
  private timer2: AVRTimer | null = null;
  private adc: AVRADC | null = null;

  private animationFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private lastTimestamp: number = 0;
  private calculatedMhz: number = 16.0;

  // Servo pulse measurement (pin 9 / PB1 / Timer1)
  private pinHighCycles: Record<number, number> = {};
  private activeToneFreq: number = 0;

  constructor(
    blueprint: CircuitBlueprint,
    progBytes: Uint8Array,
    onStateChange: (state: SimulationState) => void,
    onRegistersChange?: (regs: CpuRegisters) => void
  ) {
    this.blueprint = blueprint;
    this.onStateChange = onStateChange;
    this.onRegistersChange = onRegistersChange;
    this.boardId =
      blueprint.components.find((c) => c.type.startsWith("board:"))?.id ?? "uno_1";
    this.netResolver = buildNetResolver(blueprint.components, blueprint.connections);

    const initialCompStates: Record<string, LiveComponentState> = {};
    blueprint.components.forEach((c) => {
      if (c.type === "input:photoresistor") {
        initialCompStates[c.id] = { lightLevel: 450 };
      } else if (c.type === "input:potentiometer") {
        initialCompStates[c.id] = { potValue: 512 };
      } else if (c.type === "output:servo") {
        initialCompStates[c.id] = { servoAngle: 90 };
      } else if (c.type === "output:led") {
        initialCompStates[c.id] = { isOn: false, brightness: 0 };
      } else if (c.type === "output:buzzer" || c.type === "output:speaker") {
        initialCompStates[c.id] = { isBuzzing: false, frequency: 0 };
      } else if (c.type === "output:dc-motor") {
        initialCompStates[c.id] = { motorSpeed: 0 };
      } else if (c.type === "passive:transistor-npn") {
        initialCompStates[c.id] = { isConducting: false };
      } else {
        const dims = getLcdDimensions(c.type);
        if (dims) {
          this.lcdDecoders.set(c.id, new Hd44780Decoder(dims.cols, dims.rows));
          initialCompStates[c.id] = { lcdText: " ".repeat(dims.cols * dims.rows) };
        }
        const pixelCount = getNeoPixelCount(c.type, c.properties);
        if (pixelCount) {
          this.neoPixelDecoders.set(c.id, new Ws2812Decoder(pixelCount, 16_000_000));
          initialCompStates[c.id] = { neoPixels: Array.from({ length: pixelCount }, () => ({ r: 0, g: 0, b: 0 })) };
        }
      }
    });

    this.state = {
      isRunning: false,
      isPaused: false,
      timeMs: 0,
      speed: 1,
      soundMuted: false,
      serialLogs: [{ id: "avr-init", text: "[AVR8js ATmega328P Core: Ready (16.00 MHz)]", time: 0 }],
      digitalPins: {},
      analogPins: { A0: 450, A1: 512, A2: 0, A3: 0, A4: 0, A5: 0 },
      pwmPins: {},
      componentStates: initialCompStates,
      executionError: null,
    };

    this.initHardware(progBytes);
    this.initializeButtonIdleStates();
  }

  private initHardware(progBytes: Uint8Array) {
    const progWords = new Uint16Array(progBytes.buffer);
    this.cpu = new CPU(progWords);
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    this.usart = new AVRUSART(this.cpu, usart0Config, 16e6);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    this.adc = new AVRADC(this.cpu, adcConfig);

    // Initial ADC voltages (A0: 450/1023*5V, etc.)
    if (this.adc) {
      this.adc.channelValues[0] = (450 / 1023) * 5.0;
      this.adc.channelValues[1] = (512 / 1023) * 5.0;
    }

    // USART RX/TX Serial logging
    this.usart.onByteTransmit = (byte: number) => {
      const char = String.fromCharCode(byte);
      this.appendSerialChar(char);
    };

    // Listen to Port B pins: PB0..PB5 -> Arduino pins 8..13
    this.portB.addListener((value: number) => {
      for (let pin = 0; pin <= 5; pin++) {
        const arduinoPin = pin + 8;
        const isHigh = (value & (1 << pin)) !== 0;
        this.handlePinTransition(arduinoPin, isHigh);
      }
    });

    // Listen to Port D pins: PD0..PD7 -> Arduino pins 0..7
    this.portD.addListener((value: number) => {
      for (let pin = 0; pin <= 7; pin++) {
        const arduinoPin = pin;
        const isHigh = (value & (1 << pin)) !== 0;
        this.handlePinTransition(arduinoPin, isHigh);
      }
    });
  }

  private serialBuffer: string = "";
  private appendSerialChar(char: string) {
    if (char === "\n") {
      this.addLog(this.serialBuffer);
      this.serialBuffer = "";
    } else if (char !== "\r") {
      this.serialBuffer += char;
      if (this.serialBuffer.length > 256) {
        this.addLog(this.serialBuffer);
        this.serialBuffer = "";
      }
    }
  }

  private handlePinTransition(pinNum: number, isHigh: boolean) {
    const pinKey = String(pinNum);
    const pinNameD = `D${pinNum}`;
    this.state.digitalPins[pinKey] = isHigh ? 1 : 0;

    const currentCycles = this.cpu?.cycles ?? 0;

    // Track pulse widths for servos (typically 1000us - 2000us on pins 9, 10, etc.)
    if (isHigh) {
      this.pinHighCycles[pinNum] = currentCycles;
    } else if (this.pinHighCycles[pinNum]) {
      const highDurationCycles = currentCycles - this.pinHighCycles[pinNum];
      // 16MHz clock: 1us = 16 cycles. 1000us = 16000 cycles (0 deg), 2000us = 32000 cycles (180 deg)
      if (highDurationCycles >= 8000 && highDurationCycles <= 40000) {
        const angle = Math.round(
          Math.max(0, Math.min(180, ((highDurationCycles - 16000) / 16000) * 180))
        );
        this.updateServoAngle(angle);
      }
      delete this.pinHighCycles[pinNum];
    }

    // Feed any NeoPixel/WS2812 chains whose data-in pin is reachable from this board pin.
    // This needs the exact cycle-accurate edge timing (not just before/after state), so it
    // hooks in here directly rather than going through the net-resolver-driven sync below.
    if (this.neoPixelDecoders.size > 0) {
      this.feedNeoPixelEdge(pinKey, isHigh, currentCycles);
    }

    // Sync to visual components (LED, Buzzer, Relay)
    this.syncPinToComponents(pinNameD, pinKey, isHigh);
  }

  private feedNeoPixelEdge(pinKey: string, isHigh: boolean, cycles: number) {
    const connected = this.netResolver.getConnectedPins(this.boardId, pinKey);
    for (const key of connected) {
      const sepIdx = key.indexOf(":");
      const targetCompId = key.slice(0, sepIdx);
      const targetPin = key.slice(sepIdx + 1);
      if (targetPin !== "DIN") continue;
      const decoder = this.neoPixelDecoders.get(targetCompId);
      if (!decoder) continue;
      if (decoder.onPinTransition(isHigh, cycles)) {
        this.commitNeoPixelFrame(targetCompId, decoder);
      }
    }
  }

  private commitNeoPixelFrame(compId: string, decoder: Ws2812Decoder) {
    const compState = this.state.componentStates[compId];
    if (compState) compState.neoPixels = decoder.getPixels();
  }

  private syncPinToComponents(_pinNameD: string, pinKey: string, isHigh: boolean) {
    // Resolves everything electrically connected to this board pin - explicit wires plus
    // any breadboard column/rail it passes through - not just direct 1-hop wires.
    const connected = this.netResolver.getConnectedPins(this.boardId, pinKey);
    this.applyDriveToNet(connected, isHigh);
  }

  /** Applies a HIGH/LOW drive signal to every output-type component reachable in the
   *  given net. Also handles NPN transistors used as a base-driven switch: closing one
   *  bridges its collector-emitter (via the net resolver) and recurses the same drive
   *  signal into whatever's on the load side, so a load powered from a fixed rail and
   *  switched to ground through the transistor still updates correctly. */
  private applyDriveToNet(netKeys: Iterable<string>, isHigh: boolean) {
    for (const key of netKeys) {
      const sepIdx = key.indexOf(":");
      const targetCompId = key.slice(0, sepIdx);
      if (targetCompId === this.boardId) continue;
      const targetPin = key.slice(sepIdx + 1);
      const comp = this.blueprint.components.find((c) => c.id === targetCompId);
      const compState = this.state.componentStates[targetCompId];

      if (comp?.type === "passive:transistor-npn" && targetPin === "B") {
        this.setTransistorConducting(targetCompId, isHigh);
        continue;
      }

      if (!compState) continue;

      if (comp?.type === "output:led") {
        compState.isOn = isHigh;
        compState.brightness = isHigh ? 255 : 0;
      } else if (comp?.type === "output:buzzer" || comp?.type === "output:speaker") {
        compState.isBuzzing = isHigh;
        if (isHigh) {
          compState.frequency = 1000;
          if (!this.state.soundMuted && this.activeToneFreq !== 1000) {
            this.activeToneFreq = 1000;
            audioEngine.playTone(1000);
          }
        } else {
          if (this.activeToneFreq > 0) {
            this.activeToneFreq = 0;
            audioEngine.stopTone();
          }
        }
      } else if (comp?.type === "output:dc-motor") {
        compState.motorSpeed = isHigh ? 255 : 0;
      } else if (comp?.type === "display:lcd1602" || comp?.type === "display:lcd2004") {
        const role = LCD_PIN_ROLES[targetPin];
        if (role) {
          const decoder = this.lcdDecoders.get(targetCompId);
          if (decoder && decoder.setPin(role, isHigh)) {
            compState.lcdText = decoder.getLines().join("");
          }
        }
      }
    }
  }

  /** Toggles an NPN transistor's collector-emitter bridge based on its base drive level,
   *  then propagates the same drive signal to whatever the collector/emitter reach. */
  private setTransistorConducting(transistorId: string, isHigh: boolean) {
    if (isHigh) this.closedSwitches.add(transistorId);
    else this.closedSwitches.delete(transistorId);
    this.netResolver = buildNetResolver(this.blueprint.components, this.blueprint.connections, this.closedSwitches);

    if (!this.state.componentStates[transistorId]) this.state.componentStates[transistorId] = {};
    this.state.componentStates[transistorId].isConducting = isHigh;

    const loadNet = this.netResolver.getConnectedPins(transistorId, "C");
    this.applyDriveToNet(loadNet, isHigh);
  }

  private updateServoAngle(angle: number) {
    Object.entries(this.state.componentStates).forEach(([id, compState]) => {
      const comp = this.blueprint.components.find((c) => c.id === id);
      if (comp && comp.type === "output:servo") {
        compState.servoAngle = angle;
      }
    });
  }

  /** Scans every pin this component is wired on and resolves its net for a board "A{n}" pin. */
  private findConnectedBoardAnalogPin(componentId: string): string | null {
    const candidatePins = new Set<string>();
    this.blueprint.connections.forEach((c) => {
      if (c.from_id === componentId) candidatePins.add(c.from_pin);
      if (c.to_id === componentId) candidatePins.add(c.to_pin);
    });

    const boardPrefix = `${this.boardId}:A`;
    for (const pin of candidatePins) {
      const net = this.netResolver.getConnectedPins(componentId, pin);
      for (const key of net) {
        if (key.startsWith(boardPrefix)) {
          return key.slice(this.boardId.length + 1);
        }
      }
    }
    return null;
  }

  public updateSensorInput(componentId: string, valueKey: "lightLevel" | "potValue", value: number) {
    if (!this.state.componentStates[componentId]) {
      this.state.componentStates[componentId] = {};
    }
    this.state.componentStates[componentId][valueKey] = value;

    // Find which board analog pin this component's net reaches (possibly via a
    // breadboard column, not just a direct wire).
    const pinName = this.findConnectedBoardAnalogPin(componentId) ?? "A0";
    this.state.analogPins[pinName] = value;

    // Map pin to ADC channel (A0 -> 0, A1 -> 1, ...)
    const channel = parseInt(pinName.replace("A", ""), 10) || 0;
    if (this.adc && channel >= 0 && channel < 8) {
      this.adc.channelValues[channel] = (value / 1023) * 5.0;
    }

    this.notify();
  }

  /** Drives an external value onto a board digital input pin (bypasses the CPU driving it). */
  private driveBoardDigitalPin(pinLabel: string, high: boolean) {
    const n = parseInt(pinLabel.replace(/^D/i, ""), 10);
    if (isNaN(n)) return;
    if (n >= 0 && n <= 7) this.portD?.setPin(n, high);
    else if (n >= 8 && n <= 13) this.portB?.setPin(n - 8, high);
  }

  /** avr8js doesn't simulate internal pull-ups pulling an unset input pin high, so every
   *  button's idle (unpressed) state must be explicitly driven HIGH to match the common
   *  INPUT_PULLUP wiring convention (button to GND, reads LOW only while pressed). */
  private initializeButtonIdleStates() {
    this.blueprint.components.forEach((comp) => {
      const topo = SWITCH_TOPOLOGY[comp.type];
      if (!topo?.dynamicBridge) return;
      topo.dynamicBridge.forEach((terminalPin) => {
        this.netResolver.getConnectedPins(comp.id, terminalPin).forEach((key) => {
          if (!key.startsWith(`${this.boardId}:`)) return;
          this.driveBoardDigitalPin(key.slice(this.boardId.length + 1), true);
        });
      });
    });
  }

  /** Called when a clickable switch/button on the canvas is pressed or released.
   *  Assumes the common INPUT_PULLUP convention: idle = HIGH, pressed = pulled LOW. */
  public setDigitalInputPin(componentId: string, pressed: boolean) {
    if (pressed) this.closedSwitches.add(componentId);
    else this.closedSwitches.delete(componentId);
    this.netResolver = buildNetResolver(this.blueprint.components, this.blueprint.connections, this.closedSwitches);

    const comp = this.blueprint.components.find((c) => c.id === componentId);
    const topo = comp ? SWITCH_TOPOLOGY[comp.type] : undefined;
    if (topo?.dynamicBridge) {
      topo.dynamicBridge.forEach((terminalPin) => {
        this.netResolver.getConnectedPins(componentId, terminalPin).forEach((key) => {
          if (!key.startsWith(`${this.boardId}:`)) return;
          this.driveBoardDigitalPin(key.slice(this.boardId.length + 1), !pressed);
        });
      });
    }

    if (!this.state.componentStates[componentId]) this.state.componentStates[componentId] = {};
    this.state.componentStates[componentId].isPressed = pressed;
    this.notify();
  }

  public writeSerial(data: string) {
    if (!this.usart) return;
    for (let i = 0; i < data.length; i++) {
      this.usart.writeByte(data.charCodeAt(i));
    }
    this.addLog(`[TX -> Arduino]: ${data}`);
  }

  public start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.lastTimestamp = performance.now();
    this.addLog("--- AVR8js Microcontroller Core Running (16MHz) ---");
    this.loop();
    this.notify();
  }

  public pause() {
    this.state.isPaused = true;
    audioEngine.stopTone();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.notify();
  }

  public resume() {
    if (!this.state.isRunning) {
      this.start();
      return;
    }
    this.state.isPaused = false;
    this.lastTimestamp = performance.now();
    this.loop();
    this.notify();
  }

  public reset(newProgBytes?: Uint8Array) {
    this.stop();
    if (newProgBytes) {
      this.initHardware(newProgBytes);
      this.initializeButtonIdleStates();
    } else if (this.cpu) {
      this.cpu.reset();
    }
    this.state.timeMs = 0;
    this.state.digitalPins = {};
    this.state.pwmPins = {};
    this.activeToneFreq = 0;
    audioEngine.stopTone();
    this.addLog("--- AVR MCU Core Reset ---");
    this.notify();
  }

  public stop() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    audioEngine.stopTone();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.notify();
  }

  public step() {
    if (!this.cpu) return;
    avrInstruction(this.cpu);
    this.cpu.tick();
    this.emitRegisters();
    this.notify();
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    this.notify();
  }

  public toggleMute() {
    this.state.soundMuted = !this.state.soundMuted;
    audioEngine.setMute(this.state.soundMuted);
    this.notify();
  }

  public clearLogs() {
    this.state.serialLogs = [];
    this.notify();
  }

  private loop = () => {
    if (!this.state.isRunning || this.state.isPaused || this.isDestroyed || !this.cpu) {
      return;
    }

    const now = performance.now();
    const deltaMs = Math.min(50, now - this.lastTimestamp);
    this.lastTimestamp = now;

    // 16,000,000 cycles per second base -> cycles for deltaMs
    const speed = this.state.speed || 1.0;
    const targetCycles = Math.round((16000000 * (deltaMs / 1000)) * speed);

    const startCycles = this.cpu.cycles;
    const endCycles = startCycles + targetCycles;

    // Run cycles in micro-batches
    while (this.cpu.cycles < endCycles) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }

    const executedDelta = this.cpu.cycles - startCycles;
    this.state.timeMs += Math.round(deltaMs * speed);

    // Calculate real-time MHz
    if (deltaMs > 0) {
      this.calculatedMhz = (executedDelta / (deltaMs * 1000));
    }

    // Real WS2812 chips latch on an idle timeout, not just "the next edge arrives" - a
    // sketch that calls show() once and then never touches the pin again still needs its
    // frame committed, so check every batch rather than only from handlePinTransition.
    if (this.neoPixelDecoders.size > 0) {
      this.neoPixelDecoders.forEach((decoder, compId) => {
        if (decoder.checkIdleTimeout(this.cpu!.cycles)) {
          this.commitNeoPixelFrame(compId, decoder);
        }
      });
    }

    this.emitRegisters();
    this.notify();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private emitRegisters() {
    if (!this.cpu || !this.onRegistersChange) return;

    const data = this.cpu.data;
    const r: number[] = [];
    for (let i = 0; i < 32; i++) {
      r.push(data[i]);
    }

    const sregByte = this.cpu.data[95]; // 0x5F Status Register in ATmega328P
    const sreg = {
      c: (sregByte & 0x01) !== 0,
      z: (sregByte & 0x02) !== 0,
      n: (sregByte & 0x04) !== 0,
      v: (sregByte & 0x08) !== 0,
      s: (sregByte & 0x10) !== 0,
      h: (sregByte & 0x20) !== 0,
      t: (sregByte & 0x40) !== 0,
      i: (sregByte & 0x80) !== 0,
    };

    const sp = this.cpu.data[93] | (this.cpu.data[94] << 8);

    this.onRegistersChange({
      r,
      pc: this.cpu.pc,
      sp,
      sreg,
      cycles: this.cpu.cycles,
      frequencyMhz: Number(this.calculatedMhz.toFixed(2)),
    });
  }

  private addLog(text: string) {
    if (!text.trim()) return;
    this.state.serialLogs.push({
      id: `${Date.now()}-${Math.random()}`,
      text,
      time: this.state.timeMs,
    });
    if (this.state.serialLogs.length > 300) {
      this.state.serialLogs.shift();
    }
  }

  private notify() {
    if (this.isDestroyed) return;
    this.onStateChange({ ...this.state });
  }

  public getState(): SimulationState {
    return this.state;
  }

  public destroy() {
    this.isDestroyed = true;
    this.stop();
    audioEngine.stopTone();
  }
}
