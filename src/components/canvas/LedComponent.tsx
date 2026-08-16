import React from "react";
import { LedColor } from "../../types/circuit";

interface LedComponentProps {
  id: string;
  x: number;
  y: number;
  color?: LedColor | string;
  isOn?: boolean;
  brightness?: number; // 0 - 255
  highlightedPin?: string | null;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
}

export const LedComponent: React.FC<LedComponentProps> = ({
  id,
  x,
  y,
  color = "red",
  isOn = false,
  brightness = 0,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const normColor = (color as string).toLowerCase();

  const colorMap: Record<string, { off: string; on: string; glow: string }> = {
    red: { off: "#7f1d1d", on: "#ef4444", glow: "rgba(239, 68, 68, 0.7)" },
    green: { off: "#14532d", on: "#22c55e", glow: "rgba(34, 197, 94, 0.7)" },
    blue: { off: "#1e3a8a", on: "#3b82f6", glow: "rgba(59, 130, 246, 0.7)" },
    yellow: { off: "#713f12", on: "#eab308", glow: "rgba(234, 179, 8, 0.7)" },
  };

  const c = colorMap[normColor] || colorMap.red;
  const isGlowing = isOn || brightness > 10;
  const glowOpacity = isGlowing ? Math.max(0.4, (brightness || 255) / 255) : 0;

  return (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      {/* Component ID Badge */}
      <rect x="-6" y="-32" width="56" height="15" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <text x="22" y="-22" fontSize="7" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {id}
      </text>

      {/* LED Glow Flare */}
      {isGlowing && (
        <circle
          cx="22"
          cy="0"
          r={28}
          fill={c.glow}
          opacity={glowOpacity}
          filter="blur(10px)"
          className="transition-opacity duration-150"
        />
      )}

      {/* Wire Leads / Legs */}
      {/* Anode (Long leg, bent slightly) */}
      <path d="M 12 18 L 12 40" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cathode (Short leg, straight) */}
      <path d="M 32 18 L 32 40" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* LED Base Rim (Silver / Epoxy edge with cathode flat notch) */}
      <ellipse cx="22" cy="16" rx="16" ry="6" fill="#475569" />
      <ellipse cx="22" cy="14" rx="15" ry="5" fill={isGlowing ? c.on : c.off} opacity="0.8" />

      {/* LED Dome Body */}
      <path
        d="M 8 15 C 8 -10, 36 -10, 36 15 Z"
        fill={isGlowing ? c.on : c.off}
        stroke={isGlowing ? "#ffffff" : "#1e293b"}
        strokeWidth="1"
        className="transition-colors duration-150"
      />

      {/* Internal Cathode Flag / Anode Post (Realistic Wokwi Style) */}
      <path d="M 15 12 L 20 4 L 24 4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
      <path d="M 28 12 L 25 8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />

      {/* Glass Highlight Curved Reflection */}
      <path
        d="M 13 8 C 13 -3, 22 -6, 26 -6"
        fill="none"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Pin 1: Anode (+) at (12, 40) */}
      <g
        transform="translate(12, 40)"
        onMouseEnter={() => onPinHover?.("anode")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("anode")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "anode" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "anode" ? "#0284c7" : "#94a3b8"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-6" y="10" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          A(+)
        </text>
      </g>

      {/* Pin 2: Cathode (-) at (32, 40) */}
      <g
        transform="translate(32, 40)"
        onMouseEnter={() => onPinHover?.("cathode")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("cathode")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "cathode" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "cathode" ? "#0284c7" : "#94a3b8"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#94a3b8" fontFamily="monospace">
          K(-)
        </text>
      </g>
    </g>
  );
};
