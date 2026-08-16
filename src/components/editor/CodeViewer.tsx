import React, { useState } from "react";
import { Copy, Check, Download, Play, Code2, RefreshCw } from "lucide-react";

interface CodeViewerProps {
  code: string;
  projectTitle: string;
  onCodeChange?: (newCode: string) => void;
  onApplyAndRestart?: () => void;
  isCompiling?: boolean;
  compileStatus?: string | null;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  projectTitle,
  onCodeChange,
  onApplyAndRestart,
  isCompiling,
  compileStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);

  React.useEffect(() => {
    setEditableCode(code);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const filename = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ino`;
    const blob = new Blob([editableCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    onCodeChange?.(editableCode);
    onApplyAndRestart?.();
    setIsEditing(false);
  };

  const lines = editableCode.split("\n");

  return (
    <div className="flex flex-col h-full bg-[#020617] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
      {/* Code Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">
            sketch.ino
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
            AVR8js / GCC
          </span>
          {compileStatus && (
            <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={compileStatus}>
              • {compileStatus}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleApply}
              disabled={isCompiling}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              {isCompiling ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              {isCompiling ? "Compiling..." : "Compile & Flash"}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600"
            >
              Edit Code
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy C++ Code"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={handleDownloadIno}
            title="Download Arduino .ino File"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium transition cursor-pointer border border-slate-600"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            .ino
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="relative flex-1 overflow-auto bg-slate-950 p-3 font-mono text-[13px] leading-relaxed text-slate-200">
        {isEditing ? (
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full min-h-[480px] bg-slate-950 text-slate-100 font-mono text-[13px] leading-relaxed resize-none focus:outline-none border-none"
          />
        ) : (
          <div className="flex">
            {/* Line Numbers */}
            <div className="select-none pr-4 text-slate-600 text-right font-mono border-r border-slate-800/80 mr-4">
              {lines.map((_, idx) => (
                <div key={idx} className="h-5">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Syntax Highlighted Lines */}
            <div className="flex-1 font-mono">
              {lines.map((line, idx) => {
                const trimmed = line.trim();
                let colorClass = "text-slate-200";

                if (trimmed.startsWith("//")) {
                  colorClass = "text-slate-500 italic";
                } else if (trimmed.startsWith("#")) {
                  colorClass = "text-purple-400 font-semibold";
                } else if (
                  trimmed.includes("void setup()") ||
                  trimmed.includes("void loop()")
                ) {
                  colorClass = "text-amber-400 font-bold";
                } else if (
                  trimmed.includes("pinMode") ||
                  trimmed.includes("digitalWrite") ||
                  trimmed.includes("analogRead") ||
                  trimmed.includes("analogWrite") ||
                  trimmed.includes("tone") ||
                  trimmed.includes("noTone") ||
                  trimmed.includes("map") ||
                  trimmed.includes("constrain") ||
                  trimmed.includes("delay")
                ) {
                  colorClass = "text-sky-300 font-medium";
                } else if (trimmed.includes("Serial.")) {
                  colorClass = "text-emerald-400";
                } else if (trimmed.includes("const int") || trimmed.includes("int ") || trimmed.includes("Servo ")) {
                  colorClass = "text-blue-300";
                }

                return (
                  <div key={idx} className={`h-5 whitespace-pre ${colorClass}`}>
                    {line || " "}
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
