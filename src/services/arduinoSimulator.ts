import { CircuitBlueprint, SimulationState, LiveComponentState } from "../types/circuit";
import { buildNetResolver, NetResolver, SWITCH_TOPOLOGY } from "./circuitNet";
import { Hd44780Decoder, LCD_PIN_ROLES, getLcdDimensions } from "./hd44780";
import { RGB, getNeoPixelCount } from "./ws2812";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = this.isMuted ? 0 : 0.05; // safe comfortable volume
        this.gain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public playTone(frequency: number) {
    if (frequency <= 0) {
      this.stopTone();
      return;
    }
    this.init();
    if (!this.ctx || !this.gain) return;

    if (!this.osc) {
      this.osc = this.ctx.createOscillator();
      this.osc.type = "square"; // authentic piezo buzzer timbre
      this.osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      this.osc.connect(this.gain);
      try {
        this.osc.start();
      } catch {
        // already started
      }
    } else {
      this.osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    }
  }

  public stopTone() {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {}
      this.osc = null;
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.gain && this.ctx) {
      this.gain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime);
    }
  }

  public isMute(): boolean {
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();

export class ArduinoInterpreter {
  private blueprint: CircuitBlueprint;
  private state: SimulationState;
  private onStateChange: (state: SimulationState) => void;
  private animationFrameId: number | null = null;
  private timeoutId: any = null;
  private isDestroyed: boolean = false;
  private vars: Record<string, any> = {};
  private loopIndex: number = 0;
  private startTime: number = 0;
  private activeToneTimeout: any = null;
  private boardId: string;
  private netResolver: NetResolver;
  private closedSwitches = new Set<string>();
  private lcdDecoders = new Map<string, Hd44780Decoder>();
  private neoPixelBuffers = new Map<string, RGB[]>();

  constructor(blueprint: CircuitBlueprint, onStateChange: (state: SimulationState) => void) {
    this.blueprint = blueprint;
    this.onStateChange = onStateChange;
    this.boardId =
      blueprint.components.find((c) => c.type.startsWith("board:"))?.id ?? "uno_1";
    this.netResolver = buildNetResolver(blueprint.components, blueprint.connections);

    const initialCompStates: Record<string, LiveComponentState> = {};
    blueprint.components.forEach((c) => {
      if (c.type === "input:photoresistor") {
        initialCompStates[c.id] = { lightLevel: 450 }; // default room ambient
      } else if (c.type === "input:potentiometer") {
        initialCompStates[c.id] = { potValue: 512 }; // middle dial
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
        const pixelCount = getNeoPixelCount(c.type, c.properties);
        if (dims) {
          this.lcdDecoders.set(c.id, new Hd44780Decoder(dims.cols, dims.rows));
          initialCompStates[c.id] = { lcdText: " ".repeat(dims.cols * dims.rows) };
        } else if (pixelCount) {
          this.neoPixelBuffers.set(c.id, Array.from({ length: pixelCount }, () => ({ r: 0, g: 0, b: 0 })));
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
      serialLogs: [{ id: "init", text: "Ready. Click 'Start Simulation' to boot Arduino.", time: 0 }],
      digitalPins: {},
      analogPins: { A0: 450, A1: 512, A2: 0, A3: 0, A4: 0, A5: 0 },
      pwmPins: {},
      componentStates: initialCompStates,
      executionError: null,
    };

    this.initializeButtonIdleStates();
  }

  public getState(): SimulationState {
    return this.state;
  }

  /** Drives an external value onto a board digital input pin (bypasses whatever's driving it). */
  private driveBoardDigitalPin(pinLabel: string, high: boolean) {
    const n = pinLabel.replace(/^D/i, "");
    this.state.digitalPins[n] = high ? 1 : 0;
  }

  /** Idle (unpressed) buttons must read HIGH to match the common INPUT_PULLUP wiring
   *  convention (button to GND, reads LOW only while pressed). */
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

  public updateSensorInput(componentId: string, valueKey: "lightLevel" | "potValue", value: number) {
    if (!this.state.componentStates[componentId]) {
      this.state.componentStates[componentId] = {};
    }
    this.state.componentStates[componentId][valueKey] = value;

    // Find which board analog pin this component's net reaches (possibly via a
    // breadboard column, not just a direct wire).
    const candidatePins = new Set<string>();
    this.blueprint.connections.forEach((c) => {
      if (c.from_id === componentId) candidatePins.add(c.from_pin);
      if (c.to_id === componentId) candidatePins.add(c.to_pin);
    });
    const boardPrefix = `${this.boardId}:A`;
    let pinName: string | null = null;
    for (const pin of candidatePins) {
      const net = this.netResolver.getConnectedPins(componentId, pin);
      for (const key of net) {
        if (key.startsWith(boardPrefix)) {
          pinName = key.slice(this.boardId.length + 1);
          break;
        }
      }
      if (pinName) break;
    }
    if (pinName) {
      this.state.analogPins[pinName] = value;
    } else {
      // Default to A0 if single sensor
      this.state.analogPins["A0"] = value;
    }

    this.notify();
  }

  public start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.executionError = null;
    this.startTime = Date.now();
    this.addLog("--- Arduino Boot: Running setup() ---");

    this.initEnvironment();
    this.runSetup();
    this.scheduleNextLoop(10);
    this.notify();
  }

  public pause() {
    this.state.isPaused = true;
    this.stopAudio();
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.notify();
  }

  public resume() {
    if (!this.state.isRunning) {
      this.start();
      return;
    }
    this.state.isPaused = false;
    this.scheduleNextLoop(10);
    this.notify();
  }

  public reset(_newProgBytes?: Uint8Array) {
    this.stop();
    this.vars = {};
    this.loopIndex = 0;
    this.state.timeMs = 0;
    this.state.digitalPins = {};
    this.state.pwmPins = {};
    this.state.serialLogs = [{ id: `rst-${Date.now()}`, text: "--- Simulation Reset ---", time: 0 }];
    this.initializeButtonIdleStates();

    // Reset component visual states
    Object.keys(this.state.componentStates).forEach((k) => {
      const s = this.state.componentStates[k];
      if (s.isOn !== undefined) s.isOn = false;
      if (s.brightness !== undefined) s.brightness = 0;
      if (s.isBuzzing !== undefined) s.isBuzzing = false;
      if (s.frequency !== undefined) s.frequency = 0;
      if (s.servoAngle !== undefined) s.servoAngle = 90;
    });

    this.notify();
  }

  public stop() {
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.stopAudio();
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
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

  public step() {
    if (!this.state.isRunning) return;
    this.runLoopCycle();
  }

  public writeSerial(data: string) {
    this.addLog(`[TX -> Interpreter]: ${data}`);
  }

  private stopAudio() {
    audioEngine.stopTone();
    if (this.activeToneTimeout) {
      clearTimeout(this.activeToneTimeout);
      this.activeToneTimeout = null;
    }
    Object.values(this.state.componentStates).forEach((c) => {
      c.isBuzzing = false;
      c.frequency = 0;
    });
  }

  private addLog(text: string) {
    this.state.serialLogs.push({
      id: `${Date.now()}-${Math.random()}`,
      text,
      time: this.state.timeMs,
    });
    if (this.state.serialLogs.length > 200) {
      this.state.serialLogs.shift();
    }
  }

  private notify() {
    if (this.isDestroyed) return;
    this.onStateChange({ ...this.state });
  }

  private initEnvironment() {
    this.vars = {};
    // Extract constants from code (e.g. const int LDR_PIN = A0;)
    const code = this.blueprint.arduino_code;
    const constRegex = /(?:const\s+)?(?:int|float|double|byte|char|long)\s+([a-zA-Z0-9_]+)\s*=\s*([^;]+);/g;
    let match;
    while ((match = constRegex.exec(code)) !== null) {
      const varName = match[1].trim();
      const valStr = match[2].trim();
      if (valStr.startsWith("A")) {
        this.vars[varName] = valStr; // e.g. "A0"
      } else if (!isNaN(Number(valStr))) {
        this.vars[varName] = Number(valStr);
      } else {
        this.vars[varName] = valStr;
      }
    }
  }

  private runSetup() {
    // Look for Serial.println or pinMode calls in setup
    const code = this.blueprint.arduino_code;
    const setupMatch = code.match(/void\s+setup\s*\(\)\s*\{([^}]*)\}/s);
    if (setupMatch) {
      const setupBody = setupMatch[1];
      this.executeStatements(setupBody);
    }
  }

  private scheduleNextLoop(delayMs: number = 30) {
    if (!this.state.isRunning || this.state.isPaused || this.isDestroyed) return;

    const adjustedDelay = Math.max(5, delayMs / (this.state.speed || 1));
    this.timeoutId = setTimeout(() => {
      this.runLoopCycle();
    }, adjustedDelay);
  }

  private runLoopCycle() {
    if (!this.state.isRunning || this.state.isPaused || this.isDestroyed) return;

    this.state.timeMs += Math.round(30 * (this.state.speed || 1));
    const code = this.blueprint.arduino_code;
    const loopMatch = code.match(/void\s+loop\s*\(\)\s*\{([\s\S]*?)\n\}/);

    let loopDelay = 50;
    if (loopMatch) {
      const loopBody = loopMatch[1];
      const extractedDelay = this.executeStatements(loopBody);
      if (extractedDelay > 0) {
        loopDelay = extractedDelay;
      }
    } else {
      // Fallback heartbeat loop if code parsing is unusual
      this.executeStatements(code);
    }

    this.notify();
    this.scheduleNextLoop(loopDelay);
  }

  private executeStatements(codeBlock: string): number {
    let totalDelay = 0;

    // Helper functions for Arduino environment
    const analogRead = (pin: string | number) => {
      let pinKey = typeof pin === "string" ? pin : `A${pin}`;
      if (!pinKey.startsWith("A") && !isNaN(Number(pinKey))) {
        pinKey = `A${pinKey}`;
      }
      return this.state.analogPins[pinKey] ?? 512;
    };

    const digitalRead = (pin: string | number) => {
      const p = String(pin).replace("D", "");
      return this.state.digitalPins[p] ?? 0;
    };

    const digitalWrite = (pin: string | number, val: number | string | boolean) => {
      const pNum = String(pin).replace("D", "");
      const isHigh = val === 1 || val === "HIGH" || val === true || val === "1";
      this.state.digitalPins[pNum] = isHigh ? 1 : 0;
      this.syncPinToComponents(pNum, isHigh ? 255 : 0);
    };

    const analogWrite = (pin: string | number, val: number) => {
      const pNum = String(pin).replace("D", "");
      const bounded = Math.max(0, Math.min(255, Number(val) || 0));
      this.state.pwmPins[pNum] = bounded;
      this.syncPinToComponents(pNum, bounded);
    };

    const tone = (pin: string | number, freq: number, duration?: number) => {
      if (freq > 0) {
        if (!this.state.soundMuted) {
          audioEngine.playTone(freq);
        }
        // Update buzzer visual state
        Object.entries(this.state.componentStates).forEach(([_, c]) => {
          c.isBuzzing = true;
          c.frequency = freq;
        });

        if (duration && duration > 0) {
          if (this.activeToneTimeout) clearTimeout(this.activeToneTimeout);
          this.activeToneTimeout = setTimeout(() => {
            noTone(pin);
          }, duration / (this.state.speed || 1));
        }
      }
    };

    const noTone = (_pin?: string | number) => {
      this.stopAudio();
    };

    const servoWrite = (angle: number) => {
      const clamped = Math.max(0, Math.min(180, Number(angle) || 0));
      Object.entries(this.state.componentStates).forEach(([id, c]) => {
        const comp = this.blueprint.components.find((co) => co.id === id);
        if (comp && comp.type === "output:servo") {
          c.servoAngle = clamped;
        }
      });
    };

    const mapVal = (x: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
      return Math.round(((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin);
    };

    const constrainVal = (amt: number, low: number, high: number) => {
      return Math.max(low, Math.min(high, amt));
    };

    const Serial = {
      print: (msg: any) => {
        this.addLog(String(msg));
      },
      println: (msg: any) => {
        this.addLog(String(msg));
      },
      begin: (_baud: number) => {},
    };

    // Parse lines / expressions safely
    const lines = codeBlock.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith("//") || line.startsWith("#")) continue;

      // Handle Serial.println / print
      const serialMatch = line.match(/Serial\.(println|print)\s*\((.*)\);/);
      if (serialMatch) {
        const expr = serialMatch[2];
        const evaluated = this.evalExpression(expr);
        Serial[serialMatch[1] as "print" | "println"](evaluated);
        continue;
      }

      // Handle servo.write(angle)
      const servoMatch = line.match(/myServo\.write\s*\((.*)\);/);
      if (servoMatch) {
        const angle = this.evalExpression(servoMatch[1]);
        servoWrite(angle);
        continue;
      }

      // Handle LCD calls (lcd.print/.println/.setCursor/.clear). This interpreter doesn't
      // execute real compiled LiquidCrystal machine code, so - the same way it already
      // hardcodes servo control to a single "myServo" object - any object's print/
      // setCursor/clear call routes directly to the sole LCD component present, rather
      // than simulating RS/E/D4-D7 bit-banging (which no interpreted sketch ever does
      // directly; only the real compiled-firmware engines need the low-level decoder).
      if (this.lcdDecoders.size > 0 && !line.startsWith("Serial")) {
        const lcdId = this.lcdDecoders.keys().next().value as string;
        const decoder = this.lcdDecoders.get(lcdId)!;

        const printMatch = line.match(/^\w+\.print(?:ln)?\s*\((.*)\);/);
        if (printMatch) {
          const text = String(this.evalExpression(printMatch[1]));
          decoder.writeString(text);
          this.state.componentStates[lcdId] = {
            ...this.state.componentStates[lcdId],
            lcdText: decoder.getLines().join(""),
          };
          continue;
        }

        const setCursorMatch = line.match(/^\w+\.setCursor\s*\(([^,]+),([^)]+)\);/);
        if (setCursorMatch) {
          const col = Number(this.evalExpression(setCursorMatch[1])) || 0;
          const row = Number(this.evalExpression(setCursorMatch[2])) || 0;
          decoder.setCursorRC(col, row);
          continue;
        }

        const clearMatch = line.match(/^\w+\.clear\(\s*\);/);
        if (clearMatch) {
          decoder.clear();
          this.state.componentStates[lcdId] = {
            ...this.state.componentStates[lcdId],
            lcdText: decoder.getLines().join(""),
          };
          continue;
        }
      }

      // Handle NeoPixel calls (strip.setPixelColor/.show). Same rationale as the LCD
      // block above: this interpreter never bit-bangs real WS2812 timing, so recognize
      // Adafruit_NeoPixel's library calls directly and route them to the sole NeoPixel
      // component present. Uses a paren-depth extraction (not a naive regex) so the
      // common `strip.setPixelColor(i, strip.Color(r,g,b))` wrapped form parses
      // correctly instead of truncating at the first closing paren.
      if (this.neoPixelBuffers.size > 0) {
        const npId = this.neoPixelBuffers.keys().next().value as string;
        const buffer = this.neoPixelBuffers.get(npId)!;

        const spcIdx = line.indexOf(".setPixelColor(");
        if (spcIdx !== -1) {
          const openIdx = spcIdx + ".setPixelColor".length;
          const argsStr = this.extractBalancedParen(line, openIdx);
          if (argsStr !== null) {
            const args = this.splitTopLevelArgs(argsStr);
            const index = Math.round(Number(this.evalExpression(args[0])) || 0);
            let r = 0, g = 0, b = 0;
            if (args.length >= 4) {
              r = Math.round(Number(this.evalExpression(args[1])) || 0);
              g = Math.round(Number(this.evalExpression(args[2])) || 0);
              b = Math.round(Number(this.evalExpression(args[3])) || 0);
            } else if (args.length === 2) {
              const colorOpenIdx = args[1].indexOf(".Color(");
              if (colorOpenIdx !== -1) {
                const colorArgsStr = this.extractBalancedParen(args[1], colorOpenIdx + ".Color".length);
                if (colorArgsStr !== null) {
                  const inner = this.splitTopLevelArgs(colorArgsStr);
                  r = Math.round(Number(this.evalExpression(inner[0])) || 0);
                  g = Math.round(Number(this.evalExpression(inner[1])) || 0);
                  b = Math.round(Number(this.evalExpression(inner[2])) || 0);
                }
              }
            }
            const clamp = (v: number) => Math.max(0, Math.min(255, v));
            if (index >= 0 && index < buffer.length) {
              buffer[index] = { r: clamp(r), g: clamp(g), b: clamp(b) };
            }
          }
          continue;
        }

        if (/\.show\s*\(\s*\)\s*;/.test(line)) {
          this.state.componentStates[npId] = {
            ...this.state.componentStates[npId],
            neoPixels: buffer.map((p) => ({ ...p })),
          };
          continue;
        }
      }

      // Handle tone(pin, freq, duration?)
      const toneMatch = line.match(/tone\s*\(\s*([^,]+)\s*,\s*([^,\)]+)(?:\s*,\s*([^,\)]+))?\s*\);/);
      if (toneMatch) {
        const pin = this.evalExpression(toneMatch[1]);
        const freq = this.evalExpression(toneMatch[2]);
        const dur = toneMatch[3] ? this.evalExpression(toneMatch[3]) : undefined;
        tone(pin, Number(freq), dur ? Number(dur) : undefined);
        continue;
      }

      // Handle noTone(pin)
      const noToneMatch = line.match(/noTone\s*\(\s*([^)]*)\s*\);/);
      if (noToneMatch) {
        noTone(this.evalExpression(noToneMatch[1]));
        continue;
      }

      // Handle digitalWrite(pin, val)
      const dwMatch = line.match(/digitalWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/);
      if (dwMatch) {
        const pin = this.evalExpression(dwMatch[1]);
        const val = this.evalExpression(dwMatch[2]);
        digitalWrite(pin, val);
        continue;
      }

      // Handle analogWrite(pin, val)
      const awMatch = line.match(/analogWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\);/);
      if (awMatch) {
        const pin = this.evalExpression(awMatch[1]);
        const val = this.evalExpression(awMatch[2]);
        analogWrite(pin, Number(val));
        continue;
      }

      // Handle delay(ms)
      const delayMatch = line.match(/delay\s*\(\s*([^)]+)\s*\);/);
      if (delayMatch) {
        const ms = Number(this.evalExpression(delayMatch[1])) || 50;
        totalDelay += ms;
        continue;
      }

      // Handle variable assignment like `int lightLevel = analogRead(LDR_PIN);`
      const assignMatch = line.match(/(?:int|float|double|byte|auto)?\s*([a-zA-Z0-9_]+)\s*=\s*([^;]+);/);
      if (assignMatch) {
        const varName = assignMatch[1].trim();
        const expr = assignMatch[2].trim();
        this.vars[varName] = this.evalExpression(expr);
        continue;
      }

      // Handle if/else condition branches. Condition text is extracted via a paren-depth
      // scan (not a naive [^)]+ regex) so conditions with a nested call like
      // `if (digitalRead(pin) == LOW)` extract correctly instead of truncating at the
      // first closing paren. Both the if-body AND the else-body (if present) are always
      // consumed as a unit and only the matching one is executed - otherwise an untaken
      // branch's lines would fall through to the next loop iteration and run as if they
      // were unconditional top-level statements.
      if (line.startsWith("if")) {
        const openIdx = line.indexOf("(");
        const cond = openIdx !== -1 ? this.extractBalancedParen(line, openIdx) : null;
        if (cond !== null) {
          const isTrue = Boolean(this.evalCondition(cond));
          let ifBody = "";
          let elseBody = "";
          let inElse = false;
          let depth = 1; // already inside the if-block's opening brace
          let j = i + 1;
          while (j < lines.length && depth > 0) {
            const cur = lines[j];
            if (depth === 1 && /^\s*\}\s*else\b/.test(cur)) {
              inElse = true;
              j++;
              continue;
            }
            const opens = (cur.match(/\{/g) || []).length;
            const closes = (cur.match(/\}/g) || []).length;
            const newDepth = depth + opens - closes;
            if (newDepth <= 0) {
              j++;
              break;
            }
            if (inElse) elseBody += cur + "\n";
            else ifBody += cur + "\n";
            depth = newDepth;
            j++;
          }
          if (isTrue) {
            totalDelay += this.executeStatements(ifBody);
          } else if (elseBody) {
            totalDelay += this.executeStatements(elseBody);
          }
          i = j - 1; // the enclosing for-loop's i++ resumes right after the whole if/else
        }
      }
    }

    return totalDelay;
  }

  /** Extracts the contents between the parenthesis at `openIdx` and its matching close,
   *  tracking nesting depth (unlike a naive [^)]+ regex, which stops at the first `)`
   *  and truncates conditions containing a nested call like `digitalRead(pin)`). */
  private extractBalancedParen(str: string, openIdx: number): string | null {
    let depth = 0;
    for (let i = openIdx; i < str.length; i++) {
      if (str[i] === "(") depth++;
      else if (str[i] === ")") {
        depth--;
        if (depth === 0) return str.slice(openIdx + 1, i);
      }
    }
    return null;
  }

  /** Splits a comma-separated argument list on top-level commas only, so a nested call
   *  like `strip.Color(255, 0, 0)` passed as a single argument doesn't get split apart. */
  private splitTopLevelArgs(argsStr: string): string[] {
    const args: string[] = [];
    let depth = 0;
    let current = "";
    for (const ch of argsStr) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        args.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim().length > 0) args.push(current.trim());
    return args;
  }

  private evalCondition(condStr: string): boolean {
    try {
      let resolved = condStr;
      // Replace variable names
      Object.keys(this.vars).forEach((k) => {
        const regex = new RegExp(`\\b${k}\\b`, "g");
        resolved = resolved.replace(regex, JSON.stringify(this.vars[k]));
      });

      // Handle analogRead calls inside conditions
      resolved = resolved.replace(/analogRead\s*\(\s*([^)]+)\s*\)/g, (_, pinArg) => {
        const pin = this.evalExpression(pinArg);
        let pinKey = String(pin).startsWith("A") ? String(pin) : `A${pin}`;
        return String(this.state.analogPins[pinKey] ?? 500);
      });

      // Handle digitalRead calls inside conditions
      resolved = resolved.replace(/digitalRead\s*\(\s*([^)]+)\s*\)/g, (_, pinArg) => {
        const pin = this.evalExpression(pinArg);
        const pNum = String(pin).replace("D", "");
        return String(this.state.digitalPins[pNum] ?? 0);
      });

      // Bare HIGH/LOW literals (e.g. `if (digitalRead(pin) == LOW)`) aren't real
      // identifiers in the sandboxed Function scope, so they must be substituted too.
      resolved = resolved.replace(/\bHIGH\b/g, "1").replace(/\bLOW\b/g, "0");

      // Safe JS eval for boolean condition
      return new Function(`return Boolean(${resolved});`)();
    } catch {
      return false;
    }
  }

  private evalExpression(expr: string): any {
    const trimmed = expr.trim();
    if (trimmed === "HIGH") return 1;
    if (trimmed === "LOW") return 0;
    if (trimmed === "OUTPUT" || trimmed === "INPUT" || trimmed === "INPUT_PULLUP") return trimmed;

    // String literals
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }

    // Direct numbers
    if (!isNaN(Number(trimmed))) {
      return Number(trimmed);
    }

    // Direct variables
    if (this.vars[trimmed] !== undefined) {
      return this.vars[trimmed];
    }

    // analogRead(pin)
    const arMatch = trimmed.match(/^analogRead\s*\((.*)\)$/);
    if (arMatch) {
      const pin = this.evalExpression(arMatch[1]);
      let pinKey = String(pin).startsWith("A") ? String(pin) : `A${pin}`;
      return this.state.analogPins[pinKey] ?? 500;
    }

    // digitalRead(pin)
    const drMatch = trimmed.match(/^digitalRead\s*\((.*)\)$/);
    if (drMatch) {
      const pin = this.evalExpression(drMatch[1]);
      const pNum = String(pin).replace("D", "");
      return this.state.digitalPins[pNum] ?? 0;
    }

    // map(x, in_min, in_max, out_min, out_max)
    const mapMatch = trimmed.match(/^map\s*\(([^,]+),([^,]+),([^,]+),([^,]+),([^,]+)\)$/);
    if (mapMatch) {
      const x = Number(this.evalExpression(mapMatch[1])) || 0;
      const inMin = Number(this.evalExpression(mapMatch[2])) || 0;
      const inMax = Number(this.evalExpression(mapMatch[3])) || 1023;
      const outMin = Number(this.evalExpression(mapMatch[4])) || 0;
      const outMax = Number(this.evalExpression(mapMatch[5])) || 255;
      return Math.round(((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin);
    }

    // constrain(amt, low, high)
    const constMatch = trimmed.match(/^constrain\s*\(([^,]+),([^,]+),([^,]+)\)$/);
    if (constMatch) {
      const amt = Number(this.evalExpression(constMatch[1])) || 0;
      const low = Number(this.evalExpression(constMatch[2])) || 0;
      const high = Number(this.evalExpression(constMatch[3])) || 255;
      return Math.max(low, Math.min(high, amt));
    }

    // Try evaluating with substituted variables
    try {
      let resolved = trimmed;
      Object.keys(this.vars).forEach((k) => {
        const regex = new RegExp(`\\b${k}\\b`, "g");
        const valStr = typeof this.vars[k] === "number" ? String(this.vars[k]) : JSON.stringify(this.vars[k]);
        resolved = resolved.replace(regex, valStr);
      });
      return new Function(`return (${resolved});`)();
    } catch {
      return trimmed;
    }
  }

  private syncPinToComponents(pinNum: string, pwmValue: number) {
    const isHigh = pwmValue > 0;
    // Resolves everything electrically connected to this board pin - explicit wires plus
    // any breadboard column/rail it passes through - not just direct 1-hop wires.
    const connected = this.netResolver.getConnectedPins(this.boardId, pinNum);
    this.applyDriveToNet(connected, isHigh, pwmValue);
  }

  /** Applies a HIGH/LOW (with PWM magnitude) drive signal to every output-type component
   *  reachable in the given net. Also handles NPN transistors used as a base-driven
   *  switch: closing one bridges its collector-emitter (via the net resolver) and
   *  recurses the same drive signal into whatever's on the load side, so a load powered
   *  from a fixed rail and switched to ground through the transistor still updates. */
  private applyDriveToNet(netKeys: Iterable<string>, isHigh: boolean, pwmValue: number) {
    for (const key of netKeys) {
      const sepIdx = key.indexOf(":");
      const targetCompId = key.slice(0, sepIdx);
      if (targetCompId === this.boardId) continue;
      const targetPin = key.slice(sepIdx + 1);
      const comp = this.blueprint.components.find((c) => c.id === targetCompId);
      const compState = this.state.componentStates[targetCompId];

      if (comp?.type === "passive:transistor-npn" && targetPin === "B") {
        this.setTransistorConducting(targetCompId, isHigh, pwmValue);
        continue;
      }

      if (!compState) continue;

      if (comp?.type === "output:led") {
        compState.isOn = isHigh;
        compState.brightness = pwmValue;
      } else if (comp?.type === "output:buzzer" || comp?.type === "output:speaker") {
        compState.isBuzzing = isHigh;
      } else if (comp?.type === "output:dc-motor") {
        compState.motorSpeed = pwmValue;
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
  private setTransistorConducting(transistorId: string, isHigh: boolean, pwmValue: number) {
    if (isHigh) this.closedSwitches.add(transistorId);
    else this.closedSwitches.delete(transistorId);
    this.netResolver = buildNetResolver(this.blueprint.components, this.blueprint.connections, this.closedSwitches);

    if (!this.state.componentStates[transistorId]) this.state.componentStates[transistorId] = {};
    this.state.componentStates[transistorId].isConducting = isHigh;

    const loadNet = this.netResolver.getConnectedPins(transistorId, "C");
    this.applyDriveToNet(loadNet, isHigh, pwmValue);
  }

  public destroy() {
    this.isDestroyed = true;
    this.stop();
  }
}
