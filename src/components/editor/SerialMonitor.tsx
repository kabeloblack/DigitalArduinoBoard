import React, { useState, useRef, useEffect } from "react";
import { Terminal, Trash2, ArrowDown, Send } from "lucide-react";

interface SerialMonitorProps {
  logs: Array<{ id: string; text: string; time: number }>;
  onClear: () => void;
  onSend?: (data: string) => void;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({ logs, onClear, onSend }) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [baudRate, setBaudRate] = useState("9600");
  const [inputVal, setInputVal] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleSend = () => {
    if (inputVal) {
      onSend?.(inputVal + "\n");
      setInputVal("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl font-mono">
      {/* Serial Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Arduino Serial Monitor
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Baud Rate Selector */}
          <div className="flex items-center gap-1 text-slate-400">
            <span>Baud:</span>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(e.target.value)}
              className="bg-[#0f172a] text-slate-200 px-2 py-0.5 rounded border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="9600">9600 baud</option>
              <option value="115200">115200 baud</option>
              <option value="57600">57600 baud</option>
            </select>
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer ${
              autoScroll ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" : "bg-slate-700 text-slate-400 border border-slate-600"
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            Auto-scroll
          </button>

          <button
            onClick={onClear}
            className="p-1 hover:text-red-400 text-slate-400 hover:bg-slate-700 rounded transition cursor-pointer border border-transparent hover:border-slate-600"
            title="Clear Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Log Output Stream */}
      <div className="flex-1 overflow-auto p-3 text-[12px] space-y-1 bg-[#020617] text-emerald-400 font-mono select-text">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-4 text-center">
            Serial buffer empty. Boot simulation or call Serial.print() in Arduino sketch.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 select-none shrink-0 text-[10px] pt-0.5">
                [{Math.floor(log.time)}ms]
              </span>
              <span className="whitespace-pre-wrap break-all">{log.text}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Serial Input Bar */}
      <div className="flex items-center gap-2 p-2 bg-[#1e293b] border-t border-slate-700">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Send text command to Arduino Serial buffer..."
          className="flex-1 bg-[#0f172a] border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
        />
        <button
          onClick={handleSend}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition cursor-pointer shadow-sm"
        >
          <Send className="w-3 h-3" />
          Send
        </button>
      </div>
    </div>
  );
};
