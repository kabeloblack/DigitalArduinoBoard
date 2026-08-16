import React from "react";
import { Rp2040Registers } from "../../services/rp2040Engine";
import {
  Cpu,
  Zap,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Radio,
  Layers,
  Thermometer,
  Activity,
  Server,
  Workflow,
} from "lucide-react";

interface Rp2040CpuInspectorProps {
  registers: Rp2040Registers | null;
  isRunning: boolean;
  onStep: () => void;
  onRunToggle: () => void;
  onReset: () => void;
}

export const Rp2040CpuInspector: React.FC<Rp2040CpuInspectorProps> = ({
  registers,
  isRunning,
  onStep,
  onRunToggle,
  onReset,
}) => {
  const r = registers?.r || Array(13).fill(0);
  const pc = registers?.pc ?? 0x10000000;
  const sp = registers?.sp ?? 0x20042000;
  const lr = registers?.lr ?? 0xffffffff;
  const cycles = registers?.cycles ?? 0;
  const mhz = registers?.frequencyMhz ?? 133.0;
  const flags = registers?.xpsr || { n: false, z: true, c: false, v: false };

  const formatHex32 = (val: number) => "0x" + (val >>> 0).toString(16).toUpperCase().padStart(8, "0");
  const formatHex16 = (val: number) => "0x" + (val & 0xffff).toString(16).toUpperCase().padStart(4, "0");

  return (
    <div className="bg-[#1e293b] border border-slate-700/80 rounded-xl p-5 shadow-xl flex flex-col space-y-6">
      {/* Header with Live Emulation Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg text-white shadow-md">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              RP2040 Dual ARM Cortex-M0+ Inspector
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                133.00 MHz
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live hardware registers, PIO state machines, 12-bit SAR ADC, DMA channels, and Cortex-M0+ instruction core.
            </p>
          </div>
        </div>

        {/* Step & Run Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStep}
            title="Execute Single Cortex-M0+ Instruction"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step Inst</span>
          </button>
          <button
            onClick={onRunToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer text-white ${
              isRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? "Pause" : "Run Core"}</span>
          </button>
          <button
            onClick={onReset}
            title="Reset RP2040 Core and Registers"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Core Execution Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f172a] border border-slate-700/60 rounded-lg p-3">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">PROGRAM COUNTER (PC)</span>
          <span className="text-sm sm:text-base font-mono font-bold text-purple-400">
            {formatHex32(pc)}
          </span>
        </div>
        <div className="bg-[#0f172a] border border-slate-700/60 rounded-lg p-3">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">STACK POINTER (SP / R13)</span>
          <span className="text-sm sm:text-base font-mono font-bold text-indigo-400">
            {formatHex32(sp)}
          </span>
        </div>
        <div className="bg-[#0f172a] border border-slate-700/60 rounded-lg p-3">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">LINK REGISTER (LR / R14)</span>
          <span className="text-sm sm:text-base font-mono font-bold text-sky-400">
            {formatHex32(lr)}
          </span>
        </div>
        <div className="bg-[#0f172a] border border-slate-700/60 rounded-lg p-3">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">CORE CLOCK CYCLES</span>
          <span className="text-sm sm:text-base font-mono font-bold text-emerald-400">
            {cycles.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cortex-M0+ xPSR Status Register Flags */}
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-lg p-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          ARM Cortex-M0+ xPSR / APSR Condition Flags
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "N (Negative)", val: flags.n, desc: "Result is less than zero" },
            { label: "Z (Zero)", val: flags.z, desc: "Result equals zero" },
            { label: "C (Carry)", val: flags.c, desc: "Arithmetic carry out or unsigned overflow" },
            { label: "V (Overflow)", val: flags.v, desc: "Signed arithmetic overflow flag" },
          ].map((f) => (
            <div
              key={f.label}
              className={`p-2.5 rounded border text-center transition ${
                f.val
                  ? "bg-purple-950/70 border-purple-500 text-purple-200 shadow-sm"
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
            >
              <div className="text-xs font-mono font-bold">{f.label}</div>
              <div className={`text-base font-mono font-bold mt-1 ${f.val ? "text-purple-300" : "text-slate-600"}`}>
                {f.val ? "1" : "0"}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 hidden sm:block">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 32-bit General Purpose ARM Registers R0 - R12 */}
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-lg p-4">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-blue-400" />
          32-Bit General-Purpose Registers (R0 - R12)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {r.map((val, idx) => (
            <div key={idx} className="bg-slate-900/90 border border-slate-800 p-2 rounded">
              <span className="text-[11px] font-mono font-bold text-blue-400 block">R{idx}</span>
              <span className="text-xs font-mono text-slate-300 block">{formatHex32(val)}</span>
              <span className="text-[10px] font-mono text-slate-500 block">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RP2040 Hardware Peripherals: PIO State Machines, SAR ADC, and SIO Hardware */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PIO 0 / PIO 1 State Machines */}
        <div className="bg-[#0f172a] border border-slate-700/80 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
            <Workflow className="w-3.5 h-3.5 text-emerald-400" />
            PIO0 State Machines
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Programmable I/O dual blocks with 8 state machines executing custom protocols at 133MHz.
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">SM0 (WS2812 / PIO):</span>
              <span className="text-slate-300">PC: {formatHex16(registers?.pio0State.sm0Pc ?? 0)}</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">SM1 (SPI / I2S):</span>
              <span className="text-slate-300">PC: {formatHex16(registers?.pio0State.sm1Pc ?? 0)}</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">SM2 (UART Tx):</span>
              <span className="text-slate-300">PC: {formatHex16(registers?.pio0State.sm2Pc ?? 0)}</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">SM3 (PWM High):</span>
              <span className="text-slate-300">PC: {formatHex16(registers?.pio0State.sm3Pc ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* 12-Bit SAR ADC Channels */}
        <div className="bg-[#0f172a] border border-slate-700/80 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            12-Bit SAR ADC (GP26-GP29)
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            500kS/s successive approximation analog-to-digital converter channels.
          </p>
          <div className="space-y-2 text-xs font-mono">
            {["ADC0 (GP26 / A0)", "ADC1 (GP27 / A1)", "ADC2 (GP28 / A2)", "ADC3 (GP29 / A3)"].map(
              (name, idx) => {
                const raw = registers?.adcChannels[idx] ?? 0;
                const volts = ((raw / 1023) * 3.3).toFixed(2);
                return (
                  <div
                    key={name}
                    className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800"
                  >
                    <span className="text-amber-300 font-bold">{name}:</span>
                    <span className="text-slate-200">
                      {raw} ({volts}V)
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* SIO Hardware & Internal Temperature */}
        <div className="bg-[#0f172a] border border-slate-700/80 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
            RP2040 Hardware Accelerators
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">
            Single-cycle IO hardware divider, spinlocks, and internal die temperature sensor.
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-sky-300 font-bold">Die Temperature (ADC4):</span>
              <span className="text-slate-200 font-bold">24.5 °C</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-sky-300 font-bold">Hardware 32-bit Divider:</span>
              <span className="text-emerald-400">Ready (8 cycles)</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-sky-300 font-bold">SIO Interpolators:</span>
              <span className="text-slate-300">Lane 0 & Lane 1</span>
            </div>
            <div className="flex justify-between bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-sky-300 font-bold">Hardware Spinlocks:</span>
              <span className="text-slate-300">32 HW Mutexes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
