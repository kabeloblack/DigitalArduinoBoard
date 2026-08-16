import {
  RP2040,
  USBCDC,
  GPIOPinState,
  RPI2C,
  RPPIO,
} from "rp2040js";
import { CircuitBlueprint, SimulationState, LiveComponentState } from "../types/circuit";
import { audioEngine } from "./arduinoSimulator";
import { buildNetResolver, NetResolver, SWITCH_TOPOLOGY } from "./circuitNet";
import { Hd44780Decoder, LCD_PIN_ROLES, getLcdDimensions } from "./hd44780";
import { Ws2812Decoder, getNeoPixelCount } from "./ws2812";

export interface Rp2040Registers {
  r: number[]; // R0 - R12
  sp: number; // R13
  lr: number; // R14
  pc: number; // R15
  xpsr: {
    n: boolean;
    z: boolean;
    c: boolean;
    v: boolean;
  };
  cycles: number;
  frequencyMhz: number;
  adcChannels: number[];
  temperature: number;
  pio0State: {
    sm0Pc: number;
    sm1Pc: number;
    sm2Pc: number;
    sm3Pc: number;
  };
  dmaActiveCount: number;
}

export interface UF2Block {
  magic0: number;
  magic1: number;
  flags: number;
  targetAddr: number;
  payloadSize: number;
  blockNo: number;
  numBlocks: number;
  familyId: number;
  data: Uint8Array;
}

/**
 * Decodes a UF2 binary file into memory blocks
 */
export function parseUF2(buffer: Uint8Array): UF2Block[] {
  const blocks: UF2Block[] = [];
  const totalBlocks = Math.floor(buffer.length / 512);

  for (let i = 0; i < totalBlocks; i++) {
    const offset = i * 512;
    const view = new DataView(buffer.buffer, buffer.byteOffset + offset, 512);

    const magic0 = view.getUint32(0, true);
    const magic1 = view.getUint32(4, true);
    const magicEnd = view.getUint32(508, true);

    if (magic0 === 0x0a324655 && magic1 === 0x9e5d5157 && magicEnd === 0x0ab16f30) {
      const flags = view.getUint32(8, true);
      const targetAddr = view.getUint32(12, true);
      const payloadSize = view.getUint32(16, true);
      const blockNo = view.getUint32(20, true);
      const numBlocks = view.getUint32(24, true);
      const familyId = view.getUint32(28, true);
      const data = buffer.slice(offset + 32, offset + 32 + payloadSize);

      blocks.push({
        magic0,
        magic1,
        flags,
        targetAddr,
        payloadSize,
        blockNo,
        numBlocks,
        familyId,
        data,
      });
    }
  }

  return blocks;
}

/**
 * RP2040 Hardware Microcontroller Simulator Engine
 * Powered by Wokwi rp2040js (Dual-Core ARM Cortex-M0+ at 133MHz)
 */
export class RP2040Simulator {
  private blueprint: CircuitBlueprint;
  private state: SimulationState;
  private onStateChange: (state: SimulationState) => void;
  private onRegistersChange?: (regs: Rp2040Registers) => void;

  public mcu: RP2040;
  public cdc: USBCDC;

  private boardId: string;
  private netResolver: NetResolver;
  private closedSwitches = new Set<string>();
  private lcdDecoders = new Map<string, Hd44780Decoder>();
  private neoPixelDecoders = new Map<string, Ws2812Decoder>();

  private animationFrameId: number | null = null;
  private isDestroyed: boolean = false;
  private lastTimestamp: number = 0;
  private lastCycleCount: number = 0;
  private calculatedMhz: number = 133.0;

  // Servo pulse tracking (microseconds)
  private pinHighTimes: Record<number, number> = {};
  private activeToneFreq: number = 0;
  private serialBuffer: string = "";

  constructor(
    blueprint: CircuitBlueprint,
    firmwareUF2OrBytes?: Uint8Array,
    onStateChange?: (state: SimulationState) => void,
    onRegistersChange?: (regs: Rp2040Registers) => void
  ) {
    this.blueprint = blueprint;
    this.onStateChange = onStateChange || (() => {});
    this.onRegistersChange = onRegistersChange;
    this.boardId =
      blueprint.components.find((c) => c.type.startsWith("board:"))?.id ?? "pico_1";
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
          this.neoPixelDecoders.set(c.id, new Ws2812Decoder(pixelCount, 133_000_000));
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
      serialLogs: [
        { id: "rp2040-init", text: "[RP2040js Dual ARM Cortex-M0+ Engine: Ready (133.00 MHz)]", time: 0 },
      ],
      digitalPins: {},
      analogPins: { A0: 450, A1: 512, A2: 0, A3: 0, A4: 0, A5: 0 },
      pwmPins: {},
      componentStates: initialCompStates,
      executionError: null,
    };

    this.mcu = new RP2040();
    this.cdc = new USBCDC(this.mcu.usbCtrl);

    this.initHardware(firmwareUF2OrBytes);
    this.initializeButtonIdleStates();
  }

  private initHardware(firmwareBytes?: Uint8Array) {
    // Connect USB-CDC Serial stream
    this.cdc.onSerialData = (data: Uint8Array) => {
      for (let i = 0; i < data.length; i++) {
        const char = String.fromCharCode(data[i]);
        this.appendSerialChar(char);
      }
    };

    // Connect UART0 Hardware Serial stream
    if (this.mcu.uart && this.mcu.uart[0]) {
      (this.mcu.uart[0] as any).onByteTransmit = (byte: number) => {
        this.appendSerialChar(String.fromCharCode(byte));
      };
    }

    // Connect all 30 GPIO listeners (GP0 - GP29)
    for (let pinIdx = 0; pinIdx < this.mcu.gpio.length; pinIdx++) {
      const pin = this.mcu.gpio[pinIdx];
      const pinNum = pinIdx;

      pin.addListener((state: GPIOPinState) => {
        const isHigh = state === GPIOPinState.High;
        this.handlePinTransition(pinNum, isHigh);
      });
    }

    // Load binary if provided
    if (firmwareBytes && firmwareBytes.length > 0) {
      this.loadFirmware(firmwareBytes);
    }
  }

  public loadFirmware(firmwareBytes: Uint8Array) {
    // Check if it's a UF2 binary
    if (
      firmwareBytes.length >= 512 &&
      firmwareBytes[0] === 0x55 &&
      firmwareBytes[1] === 0x46 &&
      firmwareBytes[2] === 0x32 &&
      firmwareBytes[3] === 0x0a
    ) {
      const blocks = parseUF2(firmwareBytes);
      for (const block of blocks) {
        const addr = block.targetAddr;
        if (addr >= 0x10000000 && addr < 0x11000000) {
          const flashOffset = addr - 0x10000000;
          for (let b = 0; b < block.payloadSize; b++) {
            if (flashOffset + b < this.mcu.flash.length) {
              this.mcu.flash[flashOffset + b] = block.data[b];
            }
          }
        } else if (addr >= 0x20000000 && addr < 0x20042000) {
          const sramOffset = addr - 0x20000000;
          for (let b = 0; b < block.payloadSize; b++) {
            if (sramOffset + b < this.mcu.sram.length) {
              this.mcu.sram[sramOffset + b] = block.data[b];
            }
          }
        }
      }
      this.addLog(`[RP2040 Flash]: Loaded ${blocks.length} UF2 blocks into memory.`);
    } else {
      // Direct raw binary into Flash base (0x10000000)
      for (let i = 0; i < firmwareBytes.length && i < this.mcu.flash.length; i++) {
        this.mcu.flash[i] = firmwareBytes[i];
      }
      this.addLog(`[RP2040 Flash]: Loaded raw firmware binary (${firmwareBytes.length} bytes).`);
    }

    this.mcu.reset();
  }

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
    const pinNameGP = `GP${pinNum}`;
    const pinNameD = `D${pinNum}`;

    this.state.digitalPins[pinKey] = isHigh ? 1 : 0;
    this.state.digitalPins[pinNameGP] = isHigh ? 1 : 0;

    const currentMicroseconds = this.state.timeMs * 1000;

    // Track pulse widths for servo motors
    if (isHigh) {
      this.pinHighTimes[pinNum] = currentMicroseconds;
    } else if (this.pinHighTimes[pinNum]) {
      const durationUs = currentMicroseconds - this.pinHighTimes[pinNum];
      if (durationUs >= 500 && durationUs <= 2500) {
        const angle = Math.round(
          Math.max(0, Math.min(180, ((durationUs - 1000) / 1000) * 180))
        );
        this.updateServoAngle(angle);
      }
      delete this.pinHighTimes[pinNum];
    }

    // Feed any NeoPixel/WS2812 chains whose data-in pin is reachable from this board pin.
    // This needs true cycle-accurate edge timing - `state.timeMs` only updates once per
    // animation-frame batch, so it can't distinguish individual sub-microsecond bit
    // edges the way `mcu.core.cycles` can.
    if (this.neoPixelDecoders.size > 0) {
      this.feedNeoPixelEdge(pinKey, isHigh, this.mcu.core.cycles);
    }

    // Sync to attached visual components
    this.syncPinToComponents(pinNameGP, pinNameD, pinKey, isHigh);
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

  private syncPinToComponents(_pinNameGP: string, _pinNameD: string, pinKey: string, isHigh: boolean) {
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

  /** Scans every pin this component is wired on and resolves its net for a board ADC-capable pin. */
  private findConnectedBoardAdcPin(componentId: string): string | null {
    const candidatePins = new Set<string>();
    this.blueprint.connections.forEach((c) => {
      if (c.from_id === componentId) candidatePins.add(c.from_pin);
      if (c.to_id === componentId) candidatePins.add(c.to_pin);
    });

    for (const pin of candidatePins) {
      const net = this.netResolver.getConnectedPins(componentId, pin);
      for (const key of net) {
        if (!key.startsWith(`${this.boardId}:`)) continue;
        const boardPin = key.slice(this.boardId.length + 1);
        if (boardPin.startsWith("A") || boardPin.startsWith("GP2")) return boardPin;
      }
    }
    return null;
  }

  public updateSensorInput(componentId: string, valueKey: "lightLevel" | "potValue", value: number) {
    if (!this.state.componentStates[componentId]) {
      this.state.componentStates[componentId] = {};
    }
    this.state.componentStates[componentId][valueKey] = value;

    // Find attached analog ADC pin (GP26 / GP27 / GP28 / A0 / A1), possibly through a breadboard
    const pinName = this.findConnectedBoardAdcPin(componentId) ?? "A0";

    this.state.analogPins[pinName] = value;

    // Set voltage into RP2040 12-bit SAR ADC (3.3V reference)
    let adcChannel = 0;
    if (pinName.includes("26") || pinName === "A0") adcChannel = 0;
    else if (pinName.includes("27") || pinName === "A1") adcChannel = 1;
    else if (pinName.includes("28") || pinName === "A2") adcChannel = 2;
    else if (pinName.includes("29") || pinName === "A3") adcChannel = 3;

    if (this.mcu.adc) {
      // 0..1023 -> 0..3.3V
      const voltage = (value / 1023) * 3.3;
      if ((this.mcu.adc as any).channelValues) {
        (this.mcu.adc as any).channelValues[adcChannel] = voltage;
      }
    }

    this.notify();
  }

  /** Drives an external value onto a board GPIO input pin (bypasses whatever's driving it). */
  private driveBoardDigitalPin(pinLabel: string, high: boolean) {
    const n = parseInt(pinLabel.replace(/^(GP|D)/i, ""), 10);
    if (isNaN(n) || n < 0 || n >= this.mcu.gpio.length) return;
    this.mcu.gpio[n].setInputValue(high);
  }

  /** rp2040js doesn't simulate internal pull-ups pulling an unset input pin high, so every
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
    // Send to USB-CDC buffer
    const bytes = new TextEncoder().encode(data);
    for (let i = 0; i < bytes.length; i++) {
      this.cdc.sendSerialByte(bytes[i]);
    }
    this.addLog(`[TX -> RP2040 CDC]: ${data}`);
  }

  public start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.lastTimestamp = performance.now();
    this.lastCycleCount = this.mcu.core.cycles;
    this.addLog("--- RP2040js Dual Cortex-M0+ Core Running (133MHz) ---");
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

  public reset() {
    this.stop();
    this.mcu.reset();
    this.initializeButtonIdleStates();
    this.state.timeMs = 0;
    this.state.digitalPins = {};
    this.state.pwmPins = {};
    this.activeToneFreq = 0;
    audioEngine.stopTone();
    this.addLog("--- RP2040 MCU Core Reset (0x10000000) ---");
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
    this.mcu.step();
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
    if (!this.state.isRunning || this.state.isPaused || this.isDestroyed) {
      return;
    }

    const now = performance.now();
    const deltaMs = Math.min(50, now - this.lastTimestamp);
    this.lastTimestamp = now;

    // RP2040 base clock: 133,000,000 Hz
    const speed = this.state.speed || 1.0;
    const targetCycles = Math.round(133000000 * (deltaMs / 1000) * speed);

    const startCycles = this.mcu.core.cycles;
    const endCycles = startCycles + targetCycles;

    // Micro-batch execution of Cortex-M0+ instructions
    try {
      while (this.mcu.core.cycles < endCycles) {
        this.mcu.step();
      }
    } catch (e: any) {
      // Catch any unmapped address access safely
    }

    const executedDelta = this.mcu.core.cycles - startCycles;
    this.state.timeMs += Math.round(deltaMs * speed);

    if (deltaMs > 0) {
      this.calculatedMhz = executedDelta / (deltaMs * 1000);
    }

    // Real WS2812 chips latch on an idle timeout, not just "the next edge arrives" - a
    // sketch that calls show() once and then never touches the pin again still needs its
    // frame committed, so check every batch rather than only from handlePinTransition.
    if (this.neoPixelDecoders.size > 0) {
      this.neoPixelDecoders.forEach((decoder, compId) => {
        if (decoder.checkIdleTimeout(this.mcu.core.cycles)) {
          this.commitNeoPixelFrame(compId, decoder);
        }
      });
    }

    this.emitRegisters();
    this.notify();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private emitRegisters() {
    if (!this.onRegistersChange) return;

    const core = this.mcu.core;
    const r: number[] = [];
    for (let i = 0; i <= 12; i++) {
      r.push(core.registers[i] ?? 0);
    }

    const regs: Rp2040Registers = {
      r,
      sp: core.SP,
      lr: core.LR,
      pc: core.PC,
      xpsr: {
        n: core.N,
        z: core.Z,
        c: core.C,
        v: core.V,
      },
      cycles: core.cycles,
      frequencyMhz: Number((this.calculatedMhz || 133.0).toFixed(2)),
      adcChannels: [
        this.state.analogPins["A0"] ?? 450,
        this.state.analogPins["A1"] ?? 512,
        this.state.analogPins["A2"] ?? 0,
        this.state.analogPins["A3"] ?? 0,
      ],
      temperature: 24.5,
      pio0State: {
        sm0Pc: (this.mcu.pio?.[0] as any)?.machines?.[0]?.pc ?? 0,
        sm1Pc: (this.mcu.pio?.[0] as any)?.machines?.[1]?.pc ?? 0,
        sm2Pc: (this.mcu.pio?.[0] as any)?.machines?.[2]?.pc ?? 0,
        sm3Pc: (this.mcu.pio?.[0] as any)?.machines?.[3]?.pc ?? 0,
      },
      dmaActiveCount: 0,
    };

    this.onRegistersChange(regs);
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
