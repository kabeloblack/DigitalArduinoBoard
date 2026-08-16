import React from "react";

interface PhotoresistorComponentProps {
  id: string;
  x: number;
  y: number;
  lightLevel?: number; // 0 - 1023
  highlightedPin?: string | null;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
  onLightChange?: (val: number) => void;
}

export const PhotoresistorComponent: React.FC<PhotoresistorComponentProps> = ({
  id,
  x,
  y,
  lightLevel = 450,
  highlightedPin,
  onPinHover,
  onPinClick,
  onLightChange,
}) => {
  return (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      {/* Component ID & Light Lux Badge */}
      <rect x="-10" y="-38" width="66" height="16" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <text x="23" y="-27" fontSize="6.5" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {id} ({Math.round(lightLevel)})
      </text>

      {/* Wire Leads */}
      <path d="M 12 28 L 12 50" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 34 28 L 34 50" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Sensor Head Disc (Ceramic Red/Orange Base) */}
      <ellipse cx="23" cy="14" rx="18" ry="14" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <ellipse cx="23" cy="14" rx="15" ry="11" fill="#fef08a" />

      {/* Cadmium Sulfide (CdS) Serpentine Wave Track */}
      <path
        d="M 12 10 Q 15 8, 18 10 T 24 10 T 30 10 T 34 10 M 12 14 Q 15 12, 18 14 T 24 14 T 30 14 T 34 14 M 12 18 Q 15 16, 18 18 T 24 18 T 30 18 T 34 18"
        fill="none"
        stroke="#dc2626"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Interactive Light Ambient Slider Overlay */}
      {onLightChange && (
        <foreignObject x="-14" y="-18" width="74" height="24">
          <div className="flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="1023"
              value={lightLevel}
              onChange={(e) => onLightChange(Number(e.target.value))}
              className="w-16 h-1.5 bg-slate-700 accent-amber-400 rounded-lg appearance-none cursor-pointer"
              title="Drag to change light level (Dark <-> Bright)"
            />
          </div>
        </foreignObject>
      )}

      {/* Pin 1 at (12, 50) */}
      <g
        transform="translate(12, 50)"
        onMouseEnter={() => onPinHover?.("pin1")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("pin1")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "pin1" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "pin1" ? "#0284c7" : "#94a3b8"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          pin1
        </text>
      </g>

      {/* Pin 2 at (34, 50) */}
      <g
        transform="translate(34, 50)"
        onMouseEnter={() => onPinHover?.("pin2")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("pin2")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "pin2" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "pin2" ? "#0284c7" : "#94a3b8"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          pin2
        </text>
      </g>
    </g>
  );
};
