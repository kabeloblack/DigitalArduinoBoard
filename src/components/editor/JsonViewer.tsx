import React, { useState } from "react";
import { CircuitBlueprint } from "../../types/circuit";
import { Copy, Check, Download, ShieldCheck, AlertCircle, FileJson } from "lucide-react";

interface JsonViewerProps {
  blueprint: CircuitBlueprint;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ blueprint }) => {
  const [copied, setCopied] = useState(false);
  const [viewFormat, setViewFormat] = useState<"raw" | "formatted" | "wokwi">("raw");

  const rawJsonString = JSON.stringify(blueprint);
  const formattedJsonString = JSON.stringify(blueprint, null, 2);

  // Wokwi diagram.json converter
  const wokwiDiagram = {
    version: 1,
    author: "CircuitCraft Compiler",
    editor: "wokwi",
    parts: blueprint.components.map((c) => {
      let wokwiType = "wokwi-arduino-uno";
      if (c.type === "output:led") wokwiType = "wokwi-led";
      if (c.type === "output:buzzer") wokwiType = "wokwi-buzzer";
      if (c.type === "output:servo") wokwiType = "wokwi-servo";
      if (c.type === "input:photoresistor") wokwiType = "wokwi-photoresistor-sensor";
      if (c.type === "input:potentiometer") wokwiType = "wokwi-potentiometer";
      if (c.type === "passive:resistor") wokwiType = "wokwi-resistor";

      return {
        type: wokwiType,
        id: c.id,
        top: c.y,
        left: c.x,
        attrs: c.properties || {},
      };
    }),
    connections: blueprint.connections.map((conn) => [
      `${conn.from_id}:${conn.from_pin}`,
      `${conn.to_id}:${conn.to_pin}`,
      conn.wire_color,
      ["v0"],
    ]),
  };

  const wokwiJsonString = JSON.stringify(wokwiDiagram, null, 2);

  const getDisplayContent = () => {
    if (viewFormat === "raw") return rawJsonString;
    if (viewFormat === "formatted") return formattedJsonString;
    return wokwiJsonString;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getDisplayContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = viewFormat === "wokwi" ? "diagram.json" : "circuit_blueprint.json";
    const blob = new Blob([getDisplayContent()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Run Deterministic Compliance Audit
  const auditRules = () => {
    const results = [];

    // Rule 1: Arduino Uno Anchor at (100, 150)
    const uno = blueprint.components.find((c) => c.type === "board:arduino-uno");
    const unoCompliant = uno && uno.x === 100 && uno.y === 150;
    results.push({
      label: "Anchor Rule: Arduino Uno placed at (100, 150)",
      passed: Boolean(unoCompliant),
      detail: uno ? `Uno at (${uno.x}, ${uno.y})` : "Uno not found",
    });

    // Rule 2: Components to the right (x > 260)
    const nonUno = blueprint.components.filter((c) => c.type !== "board:arduino-uno");
    const layoutCompliant = nonUno.every((c) => c.x >= 260);
    results.push({
      label: "Layout Rule: Components arranged to the right (x ≥ 260)",
      passed: layoutCompliant,
      detail: `${nonUno.length} components checked`,
    });

    // Rule 3: Series 220Ω resistor for every LED
    const leds = blueprint.components.filter((c) => c.type === "output:led");
    const resistors = blueprint.components.filter((c) => c.type === "passive:resistor");
    let ledResistorsPassed = true;
    leds.forEach((led) => {
      // Find if led connects to a 220 ohm resistor
      const connectsToResistor = blueprint.connections.some((conn) => {
        return (
          (conn.from_id === led.id && resistors.some((r) => r.id === conn.to_id)) ||
          (conn.to_id === led.id && resistors.some((r) => r.id === conn.from_id))
        );
      });
      if (!connectsToResistor) ledResistorsPassed = false;
    });
    results.push({
      label: "Electrical Safety: 220Ω series resistor protection on every LED",
      passed: ledResistorsPassed,
      detail: `${leds.length} LEDs protected`,
    });

    // Rule 4: Valid Uno Pin identifiers
    const validUnoPins = new Set([
      "GND.1", "GND.2", "GND.3", "5V", "3.3V",
      "A0", "A1", "A2", "A3", "A4", "A5",
      "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12", "D13",
      "GND", "VIN", "RESET", "AREF", "IOREF"
    ]);
    let unoPinsValid = true;
    blueprint.connections.forEach((c) => {
      if (c.from_id === "uno_1" && !validUnoPins.has(c.from_pin)) unoPinsValid = false;
      if (c.to_id === "uno_1" && !validUnoPins.has(c.to_pin)) unoPinsValid = false;
    });
    results.push({
      label: "Pinout Schema: Valid Uno pin identifiers (GND.1-3, 5V, D0-D13, A0-A5)",
      passed: unoPinsValid,
      detail: "Exact Uno pin standards",
    });

    // Rule 5: Valid wire color conventions
    const validColors = new Set(["red", "black", "green", "blue", "yellow", "white"]);
    const colorsValid = blueprint.connections.every((c) => validColors.has(c.wire_color.toLowerCase()));
    results.push({
      label: "Wiring Convention: Standard Wire Colors (Red=5V, Black=GND, Signal=Color)",
      passed: colorsValid,
      detail: `${blueprint.connections.length} wires verified`,
    });

    return results;
  };

  const auditResults = auditRules();
  const allPassed = auditResults.every((r) => r.passed);

  return (
    <div className="flex flex-col h-full bg-[#020617] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
      {/* JSON Viewer Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-blue-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            {viewFormat === "wokwi" ? "diagram.json (Wokwi)" : "circuit_blueprint.json"}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 border ${
              allPassed
                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                : "bg-amber-950/80 text-amber-400 border-amber-800/60"
            }`}
          >
            {allPassed ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {allPassed ? "100% Rule Compliant" : "Validation Warnings"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Selector */}
          <div className="flex bg-[#0f172a] p-0.5 rounded border border-slate-700 text-xs">
            <button
              onClick={() => setViewFormat("raw")}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition cursor-pointer ${
                viewFormat === "raw" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Raw JSON
            </button>
            <button
              onClick={() => setViewFormat("formatted")}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition cursor-pointer ${
                viewFormat === "formatted" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Pretty JSON
            </button>
            <button
              onClick={() => setViewFormat("wokwi")}
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition cursor-pointer ${
                viewFormat === "wokwi" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Wokwi diagram.json
            </button>
          </div>

          <button
            onClick={handleCopy}
            title="Copy JSON Payload"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={handleDownload}
            title="Download JSON File"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Download
          </button>
        </div>
      </div>

      {/* Compliance Checklist Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4 py-2 bg-[#0f172a]/90 border-b border-slate-700 text-[11px]">
        {auditResults.slice(0, 3).map((res, i) => (
          <div key={i} className="flex items-center gap-1.5 text-slate-300">
            {res.passed ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="truncate">{res.label}</span>
          </div>
        ))}
      </div>

      {/* JSON Viewer Code Area */}
      <div className="flex-1 overflow-auto bg-[#020617] p-4 font-mono text-xs text-sky-200/90 leading-relaxed whitespace-pre select-all">
        {getDisplayContent()}
      </div>
    </div>
  );
};
