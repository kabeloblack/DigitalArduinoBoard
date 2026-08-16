import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, Cpu, Wrench, RefreshCw, Wand2 } from "lucide-react";
import { CIRCUIT_PRESETS } from "../services/circuitPresets";
import { CircuitBlueprint } from "../types/circuit";
import { compileNaturalLanguageToCircuit } from "../services/localCompiler";

interface PromptBarProps {
  onCompile: (blueprint: CircuitBlueprint, sourcePrompt: string) => void;
  isCompiling: boolean;
}

const EXAMPLE_PROMPTS = [
  "Make a visual and audio alarm that triggers when a room goes completely dark.",
  "Precision servo angle controller driven by a rotary potentiometer dial.",
  "Light Theremin that plays musical pitches on a buzzer according to room brightness.",
  "Automated 3-phase Traffic Light Beacon with Red, Yellow, and Green LEDs and alert chime.",
];

export const PromptBar: React.FC<PromptBarProps> = ({ onCompile, isCompiling }) => {
  const [prompt, setPrompt] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = prompt.trim();
    if (!query) return;

    setStatusMessage("Compiling hardware blueprint and C++ sketch...");

    try {
      const response = await fetch("/api/compile-circuit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      if (!response.ok) {
        // Fallback gracefully to deterministic offline compiler
        const localBlueprint = compileNaturalLanguageToCircuit(query);
        onCompile(localBlueprint, query);
        setStatusMessage("Compiled via Deterministic Compiler Engine");
        setTimeout(() => setStatusMessage(null), 3000);
        return;
      }

      const data = await response.json();
      onCompile(data, query);
      setStatusMessage("Hardware Blueprint Compiled & Verified");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      // Fallback locally
      const localBlueprint = compileNaturalLanguageToCircuit(query);
      onCompile(localBlueprint, query);
      setStatusMessage("Compiled via Deterministic Compiler Engine");
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="glass-panel p-3.5 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-900/60 border border-blue-700/60 text-blue-400">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
              Deterministic Natural Language Compiler
            </h2>
            <p className="text-[11px] text-slate-400">
              Type system requirements to synthesize hardware placement, wiring jumpers, and executable C++ code.
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
          <select
            onChange={(e) => {
              const presetKey = e.target.value;
              if (presetKey && CIRCUIT_PRESETS[presetKey]) {
                const p = CIRCUIT_PRESETS[presetKey];
                setPrompt(p.conceptual_summary);
                onCompile(p, p.conceptual_summary);
              }
            }}
            className="glass-well text-slate-200 text-xs px-2.5 py-1 rounded focus:outline-none focus:border-blue-500 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Select Hardware Preset...
            </option>
            <option value="nighttime_alarm">Nighttime Alarm (LDR + Buzzer + LED)</option>
            <option value="servo_potentiometer">Servo Potentiometer Controller</option>
            <option value="light_theremin">Optical Light Theremin Synthesizer</option>
            <option value="traffic_light">Traffic Light Beacon (Red/Yellow/Green)</option>
            <option value="ultrasonic_radar">Ultrasonic HC-SR04 Proximity Radar</option>
            <option value="dht22_weather_station">DHT22 Climate Sensor & LCD1602 Display</option>
            <option value="pico_neopixel_matrix">RP2040 133MHz 8x8 NeoPixel PIO Matrix</option>
            <option value="rp2040_servo_radar">RP2040 Dual-Core Servo Radar Scanner</option>
          </select>
        </div>
      </div>

      {/* Main Input Field */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Make a visual and audio alarm that triggers when a room goes completely dark."
          className="w-full glass-well focus:border-blue-500 rounded-lg pl-3.5 pr-32 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition font-sans"
        />

        <button
          type="submit"
          disabled={isCompiling || !prompt.trim()}
          className="glass-btn-primary absolute right-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          {isCompiling ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <span>Compile</span>
              <ArrowRight className="w-3 h-3" />
            </>
          )}
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pt-0.5 no-scrollbar">
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 shrink-0">Quick prompts:</span>
        {EXAMPLE_PROMPTS.map((ex, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setPrompt(ex);
              const local = compileNaturalLanguageToCircuit(ex);
              onCompile(local, ex);
            }}
            className="glass-btn text-[11px] text-slate-400 hover:text-blue-300 px-2.5 py-0.5 rounded whitespace-nowrap transition cursor-pointer"
          >
            "{ex.length > 40 ? ex.slice(0, 38) + "..." : ex}"
          </button>
        ))}
      </div>

      {statusMessage && (
        <div className="text-[11px] text-blue-400 font-mono flex items-center gap-1.5 pt-0.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {statusMessage}
        </div>
      )}
    </div>
  );
};
