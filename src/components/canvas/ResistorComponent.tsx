import React from "react";

interface ResistorComponentProps {
  id: string;
  x: number;
  y: number;
  value?: string; // "220", "10k"
  highlightedPin?: string | null;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
}

export const ResistorComponent: React.FC<ResistorComponentProps> = ({
  id,
  x,
  y,
  value = "220",
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const normVal = (value || "220").toLowerCase().replace("ohm", "").replace(" ", "");

  // Band colors: [band1, band2, multiplier, tolerance]
  let bands = ["#dc2626", "#dc2626", "#92400e", "#d97706"]; // 220 ohm default: Red, Red, Brown, Gold
  if (normVal === "10k" || normVal === "10000") {
    bands = ["#92400e", "#0f172a", "#ea580c", "#d97706"]; // 10k ohm: Brown, Black, Orange, Gold
  } else if (normVal === "1k" || normVal === "1000") {
    bands = ["#92400e", "#0f172a", "#dc2626", "#d97706"]; // 1k: Brown, Black, Red, Gold
  } else if (normVal === "330") {
    bands = ["#ea580c", "#ea580c", "#92400e", "#d97706"]; // 330: Orange, Orange, Brown, Gold
  }

  return (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      {/* Component ID Badge */}
      <rect x="-8" y="-24" width="60" height="14" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <text x="22" y="-14" fontSize="6" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {id} ({value}Ω)
      </text>

      {/* Wire Leads Horizontal */}
      <path d="M 0 10 L 44 10" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Ceramic Beige Resistor Body with curved dog-bone silhouette */}
      <rect x="8" y="2" width="28" height="16" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />

      {/* Color Bands */}
      <rect x="12" y="2" width="3" height="16" fill={bands[0]} />
      <rect x="18" y="2" width="3" height="16" fill={bands[1]} />
      <rect x="24" y="2" width="3" height="16" fill={bands[2]} />
      <rect x="31" y="2" width="2" height="16" fill={bands[3]} />

      {/* Pin 1 at (0, 10) */}
      <g
        transform="translate(0, 10)"
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
        <text x="-12" y="3" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          pin1
        </text>
      </g>

      {/* Pin 2 at (44, 10) */}
      <g
        transform="translate(44, 10)"
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
        <text x="7" y="3" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          pin2
        </text>
      </g>
    </g>
  );
};
