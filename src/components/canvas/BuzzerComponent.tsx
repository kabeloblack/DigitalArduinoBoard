import React from "react";

interface BuzzerComponentProps {
  id: string;
  x: number;
  y: number;
  isBuzzing?: boolean;
  frequency?: number;
  highlightedPin?: string | null;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
}

export const BuzzerComponent: React.FC<BuzzerComponentProps> = ({
  id,
  x,
  y,
  isBuzzing = false,
  frequency = 0,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  return (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      {/* Component ID Badge */}
      <rect x="-6" y="-30" width="56" height="15" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <text x="22" y="-20" fontSize="7" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {id}
      </text>

      {/* Animated Sound Wave Ripples when Buzzing */}
      {isBuzzing && (
        <g className="animate-pulse">
          <circle cx="22" cy="18" r="32" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="22" cy="18" r="42" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
        </g>
      )}

      {/* Wire Leads / Pins */}
      {/* Positive Pin */}
      <path d="M 10 38 L 10 54" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Negative Pin */}
      <path d="M 34 38 L 34 54" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Buzzer Cylindrical Body (Black Plastic) */}
      <circle cx="22" cy="18" r="22" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
      <circle cx="22" cy="18" r="19" fill="#0f172a" />

      {/* Center Acoustic Hole */}
      <circle cx="22" cy="18" r="6" fill="#020617" stroke="#334155" strokeWidth="1" />

      {/* Polarity (+) marking near positive pin */}
      <text x="10" y="10" fontSize="9" fontWeight="bold" fill="#ef4444" textAnchor="middle" fontFamily="sans-serif">
        +
      </text>
      <text x="34" y="9" fontSize="9" fontWeight="bold" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">
        -
      </text>

      {frequency > 0 && isBuzzing && (
        <text x="22" y="34" fontSize="5" fill="#38bdf8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          {frequency}Hz
        </text>
      )}

      {/* Pin 1: positive (+) at (10, 54) */}
      <g
        transform="translate(10, 54)"
        onMouseEnter={() => onPinHover?.("positive")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("positive")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "positive" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "positive" ? "#0284c7" : "#ef4444"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-6" y="10" fontSize="5" fill="#ef4444" fontFamily="monospace">
          POS(+)
        </text>
      </g>

      {/* Pin 2: negative (-) at (34, 54) */}
      <g
        transform="translate(34, 54)"
        onMouseEnter={() => onPinHover?.("negative")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("negative")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "negative" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "negative" ? "#0284c7" : "#94a3b8"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          NEG(-)
        </text>
      </g>
    </g>
  );
};
