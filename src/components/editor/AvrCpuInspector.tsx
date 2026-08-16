import React from "react";
import { Cpu, Activity, Play, StepForward, RotateCcw, Database } from "lucide-react";
import { CpuRegisters } from "../../services/avr8jsEngine";

interface AvrCpuInspectorProps {
  registers: CpuRegisters | null;
  isRunning: boolean;
  onStep: () => void;
  onRunToggle: () => void;
  onReset: () => void;
}

export const AvrCpuInspector: React.FC<AvrCpuInspectorProps> = ({
  registers,
  isRunning,
  onStep,
  onRunToggle,
  onReset,
}) => {
  const flags = [
    { name: "C", desc: "Carry", active: registers?.sreg.c },
    { name: "Z", desc: "Zero", active: registers?.sreg.z },
    { name: "N", desc: "Negative", active: registers?.sreg.n },
    { name: "V", desc: "Overflow", active: registers?.sreg.v },
    { name: "S", desc: "Sign", active: registers?.sreg.s },
    { name: "H", desc: "Half Carry", active: registers?.sreg.h },
    { name: "T", desc: "Bit Copy", active: registers?.sreg.t },
    { name: "I", desc: "Global Interrupt", active: registers?.sreg.i },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl font-mono text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">
            AVR8js ATmega328P Core Diagnostics
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            16.00 MHz
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStep}
            title="Single Step (1 AVR Instruction)"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-300 rounded text-xs font-semibold transition cursor-pointer border border-slate-600"
          >
            <StepForward className="w-3.5 h-3.5" />
            Step
          </button>

          <button
            onClick={onRunToggle}
            className={`flex items-center gap-1 px-2.5 py-1 text-white rounded text-xs font-semibold transition cursor-pointer ${
              isRunning ? "bg-amber-600 hover:bg-amber-500" : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? "Pause" : "Run Core"}
          </button>

          <button
            onClick={onReset}
            title="Reset AVR CPU Core"
            className="p-1 hover:text-red-400 text-slate-400 hover:bg-slate-700 rounded transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Core Inspector Dashboard */}
      <div className="flex-1 overflow-auto p-4 space-y-4 text-xs">
        {/* Telemetry Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Program Counter (PC)
            </span>
            <span className="text-cyan-400 font-bold text-sm">
              0x{(registers?.pc ?? 0).toString(16).padStart(4, "0").toUpperCase()}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Stack Pointer (SP)
            </span>
            <span className="text-purple-400 font-bold text-sm">
              0x{(registers?.sp ?? 2143).toString(16).padStart(4, "0").toUpperCase()}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Total Cycles
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              {(registers?.cycles ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Emulation Clock
            </span>
            <span className="text-amber-400 font-bold text-sm flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              {registers?.frequencyMhz || 16.0} MHz
            </span>
          </div>
        </div>

        {/* Status Register (SREG) Bit Flags */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              SREG Status Register Flags (0x5F)
            </span>
            <span className="text-[10px] text-slate-500">
              Carry, Zero, Negative, Overflow, Sign, Half-carry, Bit-copy, Interrupt
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {flags.map((f) => (
              <div
                key={f.name}
                className={`flex flex-col items-center justify-center p-2 rounded border transition ${
                  f.active
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
                title={f.desc}
              >
                <span className="text-sm font-mono">{f.name}</span>
                <span className="text-[9px] mt-0.5">{f.active ? "1" : "0"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 32 General Purpose Registers (R0 - R31) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              General Purpose Registers (R0 – R31)
            </span>
            <span className="text-[10px] text-slate-500">Hexadecimal / Value</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {Array.from({ length: 32 }).map((_, i) => {
              const val = registers?.r[i] ?? 0;
              const isPointerReg = i >= 26; // X, Y, Z pointers
              return (
                <div
                  key={i}
                  className={`px-2 py-1 rounded border text-[11px] font-mono flex items-center justify-between ${
                    isPointerReg
                      ? "bg-blue-950/40 border-blue-800/80 text-blue-300"
                      : "bg-slate-950 border-slate-800/80 text-slate-300"
                  }`}
                  title={
                    i === 26 || i === 27
                      ? "X Pointer Register"
                      : i === 28 || i === 29
                      ? "Y Pointer Register"
                      : i === 30 || i === 31
                      ? "Z Pointer Register"
                      : `Register R${i}`
                  }
                >
                  <span className="text-slate-500 text-[10px]">r{i}</span>
                  <span className={val > 0 ? "text-cyan-300 font-semibold" : "text-slate-500"}>
                    0x{val.toString(16).padStart(2, "0").toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
