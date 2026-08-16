import React from "react";

interface PotentiometerComponentProps {
  id: string;
  x: number;
  y: number;
  value?: number; // 0 - 1023
  highlightedPin?: string | null;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
  onValueChange?: (val: number) => void;
}

export const PotentiometerComponent: React.FC<PotentiometerComponentProps> = ({
  id,
  x,
  y,
  value = 512,
  highlightedPin,
  onPinHover,
  onPinClick,
  onValueChange,
}) => {
  // Map value 0-1023 to rotation angle (-135deg to +135deg)
  const angle = ((value - 512) / 512) * 135;

  return (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      {/* Component ID & Analog Value Badge */}
      <rect x="-12" y="-38" width="72" height="16" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <text x="24" y="-27" fontSize="6.5" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {id} ({Math.round(value)})
      </text>

      {/* Wire Leads / Pins (VCC, Wiper, GND) */}
      <path d="M 8 36 L 8 54" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 24 36 L 24 54" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 40 36 L 40 54" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

      {/* Blue Plastic Housing Base */}
      <rect x="0" y="4" width="48" height="34" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />

      {/* Silver/Metal Rotary Dial */}
      <circle cx="24" cy="20" r="14" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
      <circle cx="24" cy="20" r="11" fill="#cbd5e1" />

      {/* Rotating Dial Notch indicator */}
      <g transform={`translate(24, 20) rotate(${angle})`}>
        <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
        <rect x="-1.5" y="-10" width="3" height="7" rx="1" fill="#ef4444" />
      </g>

      {/* Interactive Value Slider */}
      {onValueChange && (
        <foreignObject x="-14" y="-18" width="76" height="22">
          <div className="flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="1023"
              value={value}
              onChange={(e) => onValueChange(Number(e.target.value))}
              className="w-16 h-1.5 bg-slate-700 accent-sky-400 rounded-lg appearance-none cursor-pointer"
              title="Rotate Potentiometer Dial (0 - 1023)"
            />
          </div>
        </foreignObject>
      )}

      {/* Pin 1: VCC at (8, 54) */}
      <g
        transform="translate(8, 54)"
        onMouseEnter={() => onPinHover?.("vcc")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("vcc")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "vcc" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "vcc" ? "#0284c7" : "#ef4444"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#ef4444" fontFamily="monospace">
          vcc
        </text>
      </g>

      {/* Pin 2: Wiper (Signal) at (24, 54) */}
      <g
        transform="translate(24, 54)"
        onMouseEnter={() => onPinHover?.("wiper")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("wiper")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "wiper" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "wiper" ? "#0284c7" : "#facc15"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#facc15" fontFamily="monospace">
          wiper
        </text>
      </g>

      {/* Pin 3: GND at (40, 54) */}
      <g
        transform="translate(40, 54)"
        onMouseEnter={() => onPinHover?.("gnd")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("gnd")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "gnd" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "gnd" ? "#0284c7" : "#94a3b8"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          gnd
        </text>
      </g>
    </g>
  );
};
