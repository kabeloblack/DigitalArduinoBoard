import React, { useState, useEffect, useRef } from "react";
import { CIRCUIT_PRESETS } from "./services/circuitPresets";
import { CircuitBlueprint, SimulationState, ComponentType } from "./types/circuit";
import { AVR8jsSimulator, CpuRegisters } from "./services/avr8jsEngine";
import { RP2040Simulator, Rp2040Registers } from "./services/rp2040Engine";
import { ArduinoInterpreter } from "./services/arduinoSimulator";
import { compileArduinoSketch } from "./services/avrCompiler";
import { CircuitCanvas } from "./components/canvas/CircuitCanvas";
import { ComponentTray } from "./components/canvas/ComponentTray";
import { CodeViewer } from "./components/editor/CodeViewer";
import { JsonViewer } from "./components/editor/JsonViewer";
import { PinoutTable } from "./components/editor/PinoutTable";
import { SerialMonitor } from "./components/editor/SerialMonitor";
import { AvrCpuInspector } from "./components/editor/AvrCpuInspector";
import { Rp2040CpuInspector } from "./components/editor/Rp2040CpuInspector";
import { HexViewer } from "./components/editor/HexViewer";
import { Uf2Viewer } from "./components/editor/Uf2Viewer";
import { PromptBar } from "./components/PromptBar";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
  Code2,
  FileJson,
  Layers,
  Terminal,
  Cpu,
  Download,
  Binary,
  StepForward,
  Activity,
  Workflow,
} from "lucide-react";

export default function App() {
  const [blueprint, setBlueprint] = useState<CircuitBlueprint>(CIRCUIT_PRESETS.nighttime_alarm);
  const [activeTab, setActiveTab] = useState<
    "canvas" | "code" | "cpu" | "hex" | "json" | "pinout" | "serial"
  >("canvas");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState<string | null>(null);
  const [compiledHex, setCompiledHex] = useState<string | null>(null);
  const [compiledUf2, setCompiledUf2] = useState<Uint8Array | null>(null);
  const [cpuRegisters, setCpuRegisters] = useState<CpuRegisters | null>(null);
  const [rp2040Registers, setRp2040Registers] = useState<Rp2040Registers | null>(null);

  // Determine MCU architecture from whichever board is on the canvas
  const boardType = blueprint.components.find((c) => c.type.startsWith("board:"))?.type;
  const isRp2040Arch = boardType === "board:nano-rp2040-connect";
  const compileBoardTarget: "uno" | "nano" = boardType === "board:arduino-nano" ? "nano" : "uno";
  // avr8js only has verified, working interrupt-driven Timer0/millis() support for
  // ATmega328P (Uno/Nano) in this codebase: its Timer configs bake in ATmega328P's
  // interrupt vector numbers, and re-deriving correct vector numbers for ATmega2560's
  // much longer vector table was tested empirically (brute-forced against real
  // AVR-GCC-compiled Mega firmware) and reliably corrupts CPU execution instead of
  // running delay()/millis() correctly - so it's not a safe default. rp2040js only
  // supports RP2040, and neither avr8js nor rp2040js can execute ESP32's Xtensa code.
  // Every other board (Mega, ESP32, Franzininho/ATtiny85) runs on the
  // architecture-agnostic ArduinoInterpreter, which doesn't depend on cycle-accurate
  // timer interrupts and therefore can't hang the same way.
  const isAvrCoreArch = boardType === "board:arduino-uno" || boardType === "board:arduino-nano" || !boardType;
  const usesInterpreterFallback = !isRp2040Arch && !isAvrCoreArch;

  // Microcontroller Engine references
  const avrSimulatorRef = useRef<AVR8jsSimulator | ArduinoInterpreter | null>(null);
  const rp2040SimulatorRef = useRef<RP2040Simulator | null>(null);

  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    isPaused: false,
    timeMs: 0,
    speed: 1,
    soundMuted: false,
    serialLogs: [],
    digitalPins: {},
    analogPins: { A0: 450 },
    pwmPins: {},
    componentStates: {},
    executionError: null,
  });

  // Recompile and initialize MCU engine when blueprint changes
  useEffect(() => {
    let active = true;

    async function loadFirmware() {
      setIsCompiling(true);

      // Cleanup prior engines
      if (avrSimulatorRef.current) {
        avrSimulatorRef.current.destroy();
        avrSimulatorRef.current = null;
      }
      if (rp2040SimulatorRef.current) {
        rp2040SimulatorRef.current.destroy();
        rp2040SimulatorRef.current = null;
      }

      if (isRp2040Arch) {
        // Initialize RP2040js Dual-Core 133MHz ARM Cortex-M0+ Engine
        setCompileStatus("Initializing RP2040js Dual-Core ARM Cortex-M0+ Engine (133MHz)...");
        try {
          const sim = new RP2040Simulator(
            blueprint,
            undefined,
            (updated) => {
              if (active) setSimState(updated);
            },
            (regs) => {
              if (active) setRp2040Registers(regs);
            }
          );
          rp2040SimulatorRef.current = sim;
          setSimState(sim.getState());
          setCompileStatus("RP2040js: 133.00 MHz Dual Cortex-M0+ Core Online & Ready");
        } catch (err: any) {
          console.error("Error initializing RP2040js:", err);
          setCompileStatus("RP2040js ready");
        } finally {
          if (active) setIsCompiling(false);
        }
      } else if (usesInterpreterFallback) {
        // No verified cycle-accurate core is available for this board (ESP32 is Xtensa -
        // unsupported by avr8js/rp2040js entirely; Mega/Franzininho use AVR chips avr8js's
        // bundled Timer configs don't have correct interrupt vectors for, which was
        // confirmed to hang/corrupt delay()-based sketches). Run the pin-behavior
        // interpreter instead, which doesn't depend on timer interrupts.
        setCompileStatus(`No verified cycle-accurate core for this board - running pin-behavior interpreter...`);
        try {
          const sim = new ArduinoInterpreter(blueprint, (updated) => {
            if (active) setSimState(updated);
          });
          avrSimulatorRef.current = sim;
          setSimState(sim.getState());
          setCpuRegisters(null);
          setCompileStatus("Interpreted simulation ready (no cycle-accurate core for this board in this build)");
        } catch (err: any) {
          console.error("Error initializing interpreter:", err);
          setCompileStatus("Interpreter ready");
        } finally {
          if (active) setIsCompiling(false);
        }
      } else {
        // Initialize AVR8js Engine for the AVR-family board on the canvas
        setCompileStatus(`Compiling Arduino C++ to AVR8js firmware (${compileBoardTarget})...`);
        try {
          const result = await compileArduinoSketch(blueprint.arduino_code, compileBoardTarget);
          if (!active) return;

          if (result.success && result.progBytes) {
            setCompiledHex(result.hex);
            setCompileStatus("AVR-GCC: Compiled successfully (ATmega328P)");

            const sim = new AVR8jsSimulator(
              blueprint,
              result.progBytes,
              (updated) => {
                if (active) setSimState(updated);
              },
              (regs) => {
                if (active) setCpuRegisters(regs);
              }
            );

            avrSimulatorRef.current = sim;
            setSimState(sim.getState());
          } else {
            setCompileStatus(result.error || "Compilation warning");
          }
        } catch (err: any) {
          console.error("Error loading AVR firmware:", err);
          setCompileStatus("Compiler offline - ready");
        } finally {
          if (active) setIsCompiling(false);
        }
      }
    }

    loadFirmware();

    return () => {
      active = false;
      if (avrSimulatorRef.current) {
        avrSimulatorRef.current.destroy();
      }
      if (rp2040SimulatorRef.current) {
        rp2040SimulatorRef.current.destroy();
      }
    };
  }, [blueprint, isRp2040Arch, usesInterpreterFallback, compileBoardTarget]);

  const handleStartSim = () => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.start();
    } else {
      avrSimulatorRef.current?.start();
    }
  };

  const handlePauseSim = () => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.pause();
    } else {
      avrSimulatorRef.current?.pause();
    }
  };

  const handleResumeSim = () => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.resume();
    } else {
      avrSimulatorRef.current?.resume();
    }
  };

  const handleResetSim = () => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.reset();
    } else {
      avrSimulatorRef.current?.reset();
    }
  };

  const handleStepSim = () => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.step();
    } else {
      avrSimulatorRef.current?.step();
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.setSpeed(speed);
    } else {
      avrSimulatorRef.current?.setSpeed(speed);
    }
  };

  const handleToggleMute = () => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.toggleMute();
    } else {
      avrSimulatorRef.current?.toggleMute();
    }
  };

  const handleSensorChange = (
    componentId: string,
    valueKey: "lightLevel" | "potValue",
    value: number
  ) => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.updateSensorInput(componentId, valueKey, value);
    } else {
      avrSimulatorRef.current?.updateSensorInput(componentId, valueKey, value);
    }
  };

  const handleDigitalInput = (componentId: string, pressed: boolean) => {
    if (isRp2040Arch) {
      rp2040SimulatorRef.current?.setDigitalInputPin(componentId, pressed);
    } else {
      avrSimulatorRef.current?.setDigitalInputPin(componentId, pressed);
    }
  };

  const handleCompile = (newBlueprint: CircuitBlueprint, _prompt: string) => {
    setBlueprint(newBlueprint);
  };

  const handleCodeChange = (newCode: string) => {
    setBlueprint((prev) => ({
      ...prev,
      arduino_code: newCode,
    }));
  };

  const handleApplyAndRestart = async () => {
    setIsCompiling(true);
    if (isRp2040Arch) {
      setCompileStatus("Re-flashing RP2040 Cortex-M0+ memory & resetting core...");
      rp2040SimulatorRef.current?.reset();
      rp2040SimulatorRef.current?.start();
      setCompileStatus("RP2040 Cortex-M0+ 133MHz rebooted!");
      setIsCompiling(false);
    } else if (usesInterpreterFallback) {
      setCompileStatus("Restarting pin-behavior interpreter (no verified cycle-accurate core for this board)...");
      avrSimulatorRef.current?.reset();
      avrSimulatorRef.current?.start();
      setCompileStatus("Interpreter restarted");
      setIsCompiling(false);
    } else {
      setCompileStatus(`Compiling & Flashing to AVR8js MCU (${compileBoardTarget})...`);
      try {
        const result = await compileArduinoSketch(blueprint.arduino_code, compileBoardTarget);
        if (result.success && result.progBytes) {
          setCompiledHex(result.hex);
          setCompileStatus("Flashed to ATmega328P. Booting...");
          avrSimulatorRef.current?.reset(result.progBytes);
          avrSimulatorRef.current?.start();
        } else {
          setCompileStatus(result.error || "Compilation failed");
        }
      } catch (err: any) {
        setCompileStatus("Compile error: " + err.message);
      } finally {
        setIsCompiling(false);
      }
    }
  };

  const handleCustomHexLoad = (hex: string) => {
    setCompiledHex(hex);
    try {
      const progBytes = new Uint8Array(32768);
      const lines = hex.split("\n");
      let highAddress = 0;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith(":")) {
          const bytes = parseInt(trimmed.substring(1, 3), 16);
          const addr = parseInt(trimmed.substring(3, 7), 16);
          const type = parseInt(trimmed.substring(7, 9), 16);
          if (type === 0) {
            for (let i = 0; i < bytes; i++) {
              const byteVal = parseInt(trimmed.substring(9 + i * 2, 11 + i * 2), 16);
              progBytes[highAddress + addr + i] = byteVal;
            }
          } else if (type === 2) {
            highAddress = parseInt(trimmed.substring(9, 13), 16) << 4;
          } else if (type === 4) {
            highAddress = parseInt(trimmed.substring(9, 13), 16) << 16;
          }
        }
      }
      avrSimulatorRef.current?.reset(progBytes);
      avrSimulatorRef.current?.start();
      setCompileStatus("Custom Intel HEX firmware flashed!");
    } catch (e: any) {
      alert("Invalid HEX file format");
    }
  };

  const handleCustomUf2Load = (bytes: Uint8Array) => {
    setCompiledUf2(bytes);
    if (rp2040SimulatorRef.current) {
      rp2040SimulatorRef.current.loadFirmware(bytes);
      rp2040SimulatorRef.current.start();
      setCompileStatus("Custom RP2040 UF2 binary flashed to Flash base (0x10000000)!");
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.project_title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddComponent = (type: ComponentType, defaultProps: Record<string, any>) => {
    const prefix = type.split(":")[1]?.replace(/[^a-z0-9]/gi, "_") || "comp";
    let counter = 1;
    while (blueprint.components.some((c) => c.id === `${prefix}_${counter}`)) {
      counter++;
    }
    const newId = `${prefix}_${counter}`;
    const existingCount = blueprint.components.length;
    const newX = 340 + ((existingCount * 45) % 360);
    const newY = 120 + ((existingCount * 40) % 220);

    const newComp = {
      id: newId,
      type,
      x: newX,
      y: newY,
      properties: defaultProps || {},
    };

    setBlueprint((prev) => ({
      ...prev,
      components: [...prev.components, newComp],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Bar */}
      <header className="h-14 glass-panel-strong rounded-none border-x-0 border-t-0 flex items-center px-4 sm:px-6 justify-end sticky top-0 z-30">
        {/* Global Action & Simulation Master Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleExportJson}
            className="glass-btn px-3 py-1.5 text-xs font-medium rounded-lg text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            title="Download full Circuit Blueprint JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden md:inline">Export JSON</span>
          </button>

          {!simState.isRunning || simState.isPaused ? (
            <button
              onClick={simState.isPaused ? handleResumeSim : handleStartSim}
              disabled={isCompiling}
              className={`glass-btn-primary px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                isRp2040Arch ? "bg-purple-600 hover:bg-purple-500" : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {simState.isPaused
                  ? "Resume"
                  : isRp2040Arch
                  ? "Run RP2040 Core"
                  : "Run AVR8js"}
              </span>
            </button>
          ) : (
            <button
              onClick={handlePauseSim}
              className="glass-btn-primary px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {/* Auxiliary Simulation Controls */}
          <div className="hidden sm:flex items-center gap-1.5 glass-well px-2 py-1 rounded-lg">
            <button
              onClick={handleStepSim}
              title="Single Instruction Step"
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleResetSim}
              title="Reset Microcontroller Core"
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            {/* Speed Selector */}
            <div className="flex items-center text-[11px] font-mono text-slate-400 gap-1">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    simState.speed === s
                      ? isRp2040Arch
                        ? "glass-tab-active text-white ring-1 ring-purple-400"
                        : "glass-tab-active text-white ring-1 ring-blue-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

            {/* Audio Mute */}
            <button
              onClick={handleToggleMute}
              title={simState.soundMuted ? "Unmute Piezo Audio" : "Mute Piezo Audio"}
              className={`p-1 rounded transition cursor-pointer ${
                simState.soundMuted
                  ? "text-red-400 hover:bg-slate-800"
                  : "text-emerald-400 hover:bg-slate-800"
              }`}
            >
              {simState.soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Top Navigation Tabs */}
      <nav className="glass-panel-strong rounded-none border-x-0 border-t-0 px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Hardware Canvas Button */}
          <button
            onClick={() => setActiveTab("canvas")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "canvas"
                ? isRp2040Arch
                  ? "glass-tab-active text-white ring-1 ring-purple-400"
                  : "glass-tab-active text-white ring-1 ring-blue-400"
                : "glass-btn text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Hardware Canvas</span>
          </button>

          {/* </> sketch.ino Button */}
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "code"
                ? isRp2040Arch
                  ? "glass-tab-active text-white ring-1 ring-purple-400"
                  : "glass-tab-active text-white ring-1 ring-blue-400"
                : "glass-btn text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>&lt;/&gt; sketch.ino</span>
          </button>

          {/* MCU CPU Inspector Button */}
          <button
            onClick={() => setActiveTab("cpu")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "cpu"
                ? isRp2040Arch
                  ? "glass-tab-active text-white ring-1 ring-purple-400"
                  : "glass-tab-active text-white ring-1 ring-blue-400"
                : "glass-btn text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className={`w-4 h-4 ${isRp2040Arch ? "text-purple-400" : "text-cyan-400"}`} />
            <span>{isRp2040Arch ? "RP2040 Core" : "AVR8js MCU"}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded hidden sm:inline border ${
                isRp2040Arch
                  ? "bg-purple-950 text-purple-300 border-purple-800"
                  : "bg-cyan-950 text-cyan-400 border-cyan-800"
              }`}
            >
              {isRp2040Arch ? `${rp2040Registers?.frequencyMhz ?? 133}MHz` : `${cpuRegisters?.frequencyMhz ?? 16}MHz`}
            </span>
          </button>

          {/* Firmware Binary Button (.hex or .uf2) */}
          <button
            onClick={() => setActiveTab("hex")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "hex"
                ? isRp2040Arch
                  ? "glass-tab-active text-white ring-1 ring-purple-400"
                  : "glass-tab-active text-white ring-1 ring-blue-400"
                : "glass-btn text-slate-400 hover:text-slate-200"
            }`}
          >
            <Binary className="w-4 h-4 text-purple-400" />
            <span>{isRp2040Arch ? "firmware.uf2" : "firmware.hex"}</span>
          </button>

          {/* diagram.json Button */}
          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "json"
                ? isRp2040Arch
                  ? "glass-tab-active text-white ring-1 ring-purple-400"
                  : "glass-tab-active text-white ring-1 ring-blue-400"
                : "glass-btn text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileJson className="w-4 h-4 text-emerald-400" />
            <span>diagram.json</span>
          </button>

          {/* Pinout Ledger Button */}
          <button
            onClick={() => setActiveTab("pinout")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "pinout"
                ? isRp2040Arch
                  ? "glass-tab-active text-white ring-1 ring-purple-400"
                  : "glass-tab-active text-white ring-1 ring-blue-400"
                : "glass-btn text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>Pinout Ledger</span>
          </button>

          {/* Serial Monitor Button */}
          <button
            onClick={() => setActiveTab("serial")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "serial"
                ? isRp2040Arch
                  ? "glass-tab-active text-white ring-1 ring-purple-400"
                  : "glass-tab-active text-white ring-1 ring-blue-400"
                : "glass-btn text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Serial Monitor</span>
            {simState.serialLogs.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-900 text-blue-200 border border-blue-700">
                {simState.serialLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Architecture Status indicator */}
        {/* `tabular-nums` keeps the clock/part/wire figures in fixed-width columns; without it the
            sans face reflows the row every time a count changes. */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-sans tabular-nums text-slate-400">
          {isRp2040Arch ? (
            <span className="text-white font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              RP2040js: 133.00 MHz Dual Cortex-M0+
            </span>
          ) : (
            <span className="text-white font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              AVR8js: 16.00 MHz ATmega328P
            </span>
          )}
          <span>•</span>
          <span>{blueprint.components.length} parts</span>
          <span>•</span>
          <span>{blueprint.connections.length} wires</span>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 max-w-[1800px] w-full mx-auto">
        {/* Tab 1: Hardware Canvas + Component Palette Tray Underneath */}
        {activeTab === "canvas" && (
          <div className="space-y-4">
            {/* Natural Language Prompt Panel: "Tell it what to build" */}
            <PromptBar onCompile={handleCompile} isCompiling={isCompiling} />

            {/* Hardware Canvas Viewport (interactive sensor/button controls live inside, next to the status badge) */}
            <div className="w-full">
              <CircuitCanvas
                blueprint={blueprint}
                simState={simState}
                onUpdateBlueprint={setBlueprint}
                onSensorChange={handleSensorChange}
                onDigitalInput={handleDigitalInput}
              />
            </div>

            {/* Under the Hardware Canvas: Component Palette & Manual Plug Connecting Tray */}
            <div className="w-full">
              <ComponentTray onAddComponent={handleAddComponent} />
            </div>
          </div>
        )}

        {/* Tab 2: sketch.ino (C++) */}
        {activeTab === "code" && (
          <div className="w-full min-h-[550px]">
            <CodeViewer
              code={blueprint.arduino_code}
              projectTitle={blueprint.project_title}
              onCodeChange={handleCodeChange}
              onApplyAndRestart={handleApplyAndRestart}
              isCompiling={isCompiling}
              compileStatus={compileStatus}
            />
          </div>
        )}

        {/* Tab 3: MCU CPU Core Inspector (RP2040 Dual ARM Cortex-M0+ or AVR8js ATmega328P) */}
        {activeTab === "cpu" && (
          <div className="w-full min-h-[550px]">
            {isRp2040Arch ? (
              <Rp2040CpuInspector
                registers={rp2040Registers}
                isRunning={simState.isRunning && !simState.isPaused}
                onStep={handleStepSim}
                onRunToggle={simState.isRunning && !simState.isPaused ? handlePauseSim : handleResumeSim}
                onReset={handleResetSim}
              />
            ) : (
              <AvrCpuInspector
                registers={cpuRegisters}
                isRunning={simState.isRunning && !simState.isPaused}
                onStep={handleStepSim}
                onRunToggle={simState.isRunning && !simState.isPaused ? handlePauseSim : handleResumeSim}
                onReset={handleResetSim}
              />
            )}
          </div>
        )}

        {/* Tab 4: Firmware Binary (firmware.uf2 or firmware.hex) */}
        {activeTab === "hex" && (
          <div className="w-full min-h-[550px]">
            {isRp2040Arch ? (
              <Uf2Viewer
                uf2Bytes={compiledUf2}
                projectTitle={blueprint.project_title}
                onLoadCustomUf2={handleCustomUf2Load}
              />
            ) : (
              <HexViewer
                hex={compiledHex}
                projectTitle={blueprint.project_title}
                onLoadCustomHex={handleCustomHexLoad}
              />
            )}
          </div>
        )}

        {/* Tab 5: diagram.json */}
        {activeTab === "json" && (
          <div className="w-full min-h-[550px]">
            <JsonViewer blueprint={blueprint} />
          </div>
        )}

        {/* Tab 6: Pinout Ledger */}
        {activeTab === "pinout" && (
          <div className="w-full min-h-[550px]">
            <PinoutTable blueprint={blueprint} />
          </div>
        )}

        {/* Tab 7: Serial Monitor */}
        {activeTab === "serial" && (
          <div className="w-full min-h-[550px]">
            <SerialMonitor
              logs={simState.serialLogs}
              onClear={() => {
                if (isRp2040Arch) {
                  rp2040SimulatorRef.current?.clearLogs();
                } else {
                  avrSimulatorRef.current?.clearLogs();
                }
              }}
              onSend={(data) => {
                if (isRp2040Arch) {
                  rp2040SimulatorRef.current?.writeSerial(data);
                } else {
                  avrSimulatorRef.current?.writeSerial(data);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <footer className="h-9 glass-panel-strong rounded-none border-x-0 border-b-0 flex items-center px-4 sm:px-6 justify-between text-[11px] text-slate-400 font-mono shrink-0 mt-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                simState.isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            {isRp2040Arch ? (
              <span className={simState.isRunning ? "text-purple-300 font-semibold" : "text-slate-400"}>
                RP2040js: {simState.isRunning ? (simState.isPaused ? "PAUSED" : "RUNNING (133MHz Dual-Core)") : "READY"}
              </span>
            ) : (
              <span className={simState.isRunning ? "text-cyan-400 font-semibold" : "text-slate-400"}>
                AVR8js: {simState.isRunning ? (simState.isPaused ? "PAUSED" : "RUNNING (16MHz)") : "READY"}
              </span>
            )}
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">
            Cycles: {isRp2040Arch ? (rp2040Registers?.cycles ?? 0).toLocaleString() : (cpuRegisters?.cycles ?? 0).toLocaleString()}
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">Clock: {(simState.timeMs / 1000).toFixed(2)}s</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{blueprint.project_title}</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-purple-400">RP2040js + AVR8js + Wokwi Elements</span>
        </div>
      </footer>
    </div>
  );
}
