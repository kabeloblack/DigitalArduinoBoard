import React, { useState } from "react";
import { Binary, Copy, Check, Download, Upload, Cpu } from "lucide-react";
import { parseUF2, UF2Block } from "../../services/rp2040Engine";

interface Uf2ViewerProps {
  uf2Bytes: Uint8Array | null;
  projectTitle: string;
  onLoadCustomUf2?: (bytes: Uint8Array) => void;
}

export const Uf2Viewer: React.FC<Uf2ViewerProps> = ({
  uf2Bytes,
  projectTitle,
  onLoadCustomUf2,
}) => {
  const [copied, setCopied] = useState(false);

  const blocks: UF2Block[] = uf2Bytes ? parseUF2(uf2Bytes) : [];

  const handleCopySummary = () => {
    if (!uf2Bytes) return;
    const summary = `RP2040 UF2 Firmware Binary\nTotal Size: ${uf2Bytes.length} bytes\nBlocks: ${blocks.length}\nFamily: RP2040 (0xE48BFF56)`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!uf2Bytes) return;
    const filename = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.uf2`;
    const blob = new Blob([uf2Bytes], { type: "application/octet-stream" });
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
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer && onLoadCustomUf2) {
        onLoadCustomUf2(new Uint8Array(buffer));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatHex32 = (val: number) => "0x" + (val >>> 0).toString(16).toUpperCase().padStart(8, "0");

  return (
    <div className="flex flex-col h-full bg-[#020617] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl font-mono text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-200">
            firmware.uf2 (Raspberry Pi RP2040)
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            ARM Cortex-M0+ Binary
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600">
            <Upload className="w-3.5 h-3.5 text-purple-300" />
            <span>Upload .uf2</span>
            <input type="file" accept=".uf2,.bin" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleCopySummary}
            disabled={!uf2Bytes}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            {copied ? "Copied" : "Copy Info"}
          </button>

          <button
            onClick={handleDownload}
            disabled={!uf2Bytes}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            .uf2
          </button>
        </div>
      </div>

      {/* UF2 Structure Overview */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px]">TOTAL BINARY SIZE</span>
          <span className="text-purple-300 font-bold">{uf2Bytes ? `${uf2Bytes.length} bytes` : "0 bytes"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">UF2 512-BYTE BLOCKS</span>
          <span className="text-indigo-300 font-bold">{blocks.length} blocks</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">TARGET ARCHITECTURE</span>
          <span className="text-emerald-400 font-bold">RP2040 (0xE48BFF56)</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">FLASH ENTRY ADDRESS</span>
          <span className="text-amber-300 font-bold">0x10000000</span>
        </div>
      </div>

      {/* UF2 Blocks List */}
      <div className="flex-1 overflow-auto p-3 text-[12px] leading-relaxed bg-[#020617] font-mono">
        {blocks.length === 0 ? (
          <div className="text-slate-500 italic py-10 text-center flex flex-col items-center gap-2">
            <Cpu className="w-8 h-8 text-slate-600" />
            <span>Ready for RP2040 UF2 binary firmware. Upload a .uf2 file or run an RP2040 preset.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.slice(0, 50).map((block, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 p-2.5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px] w-12">#{block.blockNo}</span>
                  <span className="text-purple-400 font-bold">{formatHex32(block.targetAddr)}</span>
                  <span className="text-slate-400 text-xs">({block.payloadSize} payload bytes)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-slate-500">Flags: {formatHex32(block.flags)}</span>
                  <span>•</span>
                  <span className="text-emerald-400">Block {block.blockNo + 1}/{block.numBlocks}</span>
                </div>
              </div>
            ))}
            {blocks.length > 50 && (
              <div className="text-slate-500 text-center py-2 text-xs">
                ... and {blocks.length - 50} more UF2 memory blocks.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
