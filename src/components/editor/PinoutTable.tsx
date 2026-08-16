import React from "react";
import { CircuitBlueprint } from "../../types/circuit";
import { Cpu, Zap, Radio, Layers } from "lucide-react";
import { ComponentThumbnail } from "../canvas/ComponentThumbnail";

interface PinoutTableProps {
  blueprint: CircuitBlueprint;
}

export const PinoutTable: React.FC<PinoutTableProps> = ({ blueprint }) => {
  return (
    <div className="flex flex-col h-full bg-[#020617] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            Hardware Pinout & Wiring Ledger
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {blueprint.components.length} components • {blueprint.connections.length} wires
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Components Section */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            Placed Hardware Components
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0f172a] text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2 px-3">Visual</th>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Part Type</th>
                  <th className="py-2 px-3">Coordinates</th>
                  <th className="py-2 px-3">Properties / Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {blueprint.components.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3 w-16">
                      <ComponentThumbnail
                        idType={c.type}
                        properties={c.properties}
                        className="w-14 h-9"
                      />
                    </td>
                    <td className="py-2 px-3 font-bold text-blue-300">{c.id}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {c.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      x: {c.x}, y: {c.y}
                    </td>
                    <td className="py-2 px-3 text-amber-300/90">
                      {Object.keys(c.properties || {}).length > 0
                        ? JSON.stringify(c.properties)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wiring Connections Table */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-mono">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Active Wire Interconnects
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-700/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0f172a] text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-2 px-3">From Component</th>
                  <th className="py-2 px-3">From Pin</th>
                  <th className="py-2 px-3">To Component</th>
                  <th className="py-2 px-3">To Pin</th>
                  <th className="py-2 px-3">Wire Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {blueprint.connections.map((conn, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3 font-semibold text-blue-300">{conn.from_id}</td>
                    <td className="py-2 px-3 font-bold text-slate-200">{conn.from_pin}</td>
                    <td className="py-2 px-3 font-semibold text-emerald-300">{conn.to_id}</td>
                    <td className="py-2 px-3 font-bold text-slate-200">{conn.to_pin}</td>
                    <td className="py-2 px-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border"
                        style={{
                          backgroundColor:
                            conn.wire_color === "red"
                              ? "#450a0a"
                              : conn.wire_color === "black"
                              ? "#0f172a"
                              : conn.wire_color === "green"
                              ? "#052e16"
                              : conn.wire_color === "yellow"
                              ? "#422006"
                              : "#1e3a8a",
                          borderColor:
                            conn.wire_color === "red"
                              ? "#ef4444"
                              : conn.wire_color === "black"
                              ? "#475569"
                              : conn.wire_color === "green"
                              ? "#22c55e"
                              : conn.wire_color === "yellow"
                              ? "#eab308"
                              : "#3b82f6",
                          color: "#f8fafc",
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              conn.wire_color === "red"
                                ? "#ef4444"
                                : conn.wire_color === "black"
                                ? "#0f172a"
                                : conn.wire_color === "green"
                                ? "#22c55e"
                                : conn.wire_color === "yellow"
                                ? "#eab308"
                                : "#3b82f6",
                          }}
                        />
                        {conn.wire_color}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
