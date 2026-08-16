import React, { useState } from "react";
import { Binary, Copy, Check, Download, Upload } from "lucide-react";

interface HexViewerProps {
  hex: string | null;
  projectTitle: string;
  onLoadCustomHex?: (hex: string) => void;
}

export const HexViewer: React.FC<HexViewerProps> = ({ hex, projectTitle, onLoadCustomHex }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!hex) return;
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!hex) return;
    const filename = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.hex`;
    const blob = new Blob([hex], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && onLoadCustomHex) {
        onLoadCustomHex(content);
      }
    };
    reader.readAsText(file);
  };

  const lines = hex ? hex.trim().split("\n") : [];

  return (
    <div className="flex flex-col h-full bg-[#020617] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl font-mono text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-200">
            firmware.hex (Intel HEX)
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
            AVR Machine Code
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600">
            <Upload className="w-3.5 h-3.5 text-purple-300" />
            <span>Upload .hex</span>
            <input type="file" accept=".hex" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleCopy}
            disabled={!hex}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={handleDownload}
            disabled={!hex}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            .hex
          </button>
        </div>
      </div>

      {/* Hex Stream Content */}
      <div className="flex-1 overflow-auto p-3 text-[12px] leading-relaxed bg-[#020617] font-mono select-text">
        {lines.length === 0 ? (
          <div className="text-slate-500 italic py-6 text-center">
            No compiled HEX binary. Click "Compile & Flash" to generate AVR firmware.
          </div>
        ) : (
          <div className="flex">
            {/* Record Index */}
            <div className="select-none pr-3 text-slate-600 text-right font-mono border-r border-slate-800 mr-3">
              {lines.map((_, idx) => (
                <div key={idx} className="h-5">
                  {(idx + 1).toString().padStart(3, " ")}
                </div>
              ))}
            </div>

            {/* Formatted Hex Lines */}
            <div className="flex-1">
              {lines.map((line, idx) => {
                const trimmed = line.trim();
                const byteCount = trimmed.substring(1, 3);
                const address = trimmed.substring(3, 7);
                const recordType = trimmed.substring(7, 9);
                const dataBytes = trimmed.substring(9, trimmed.length - 2);
                const checksum = trimmed.substring(trimmed.length - 2);

                return (
                  <div key={idx} className="h-5 whitespace-pre">
                    <span className="text-slate-500">:</span>
                    <span className="text-amber-400">{byteCount}</span>
                    <span className="text-cyan-400">{address}</span>
                    <span className="text-emerald-400 font-bold">{recordType}</span>
                    <span className="text-slate-300 tracking-wider"> {dataBytes} </span>
                    <span className="text-purple-400">{checksum}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
