import React from "react";

interface DcMotorComponentProps {
  id: string;
  x: number;
  y: number;
  speed?: number; // 0-255, PWM-driven spin rate
  highlightedPin?: string | null;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
}

export const DcMotorComponent: React.FC<DcMotorComponentProps> = ({
  id,
  x,
  y,
  speed = 0,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const isSpinning = speed > 0;
  // Faster PWM speed -> faster visual spin; duration inverted so higher speed = shorter period.
  const spinDurationS = isSpinning ? Math.max(0.15, 1.2 - (speed / 255) * 1.0) : 0;

  return (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      <rect x="-4" y="-32" width="58" height="15" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <text x="25" y="-22" fontSize="6.5" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {id}
      </text>

      {/* Motor can body */}
      <rect x="4" y="14" width="32" height="26" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
      <rect x="4" y="14" width="32" height="8" rx="3" fill="#cbd5e1" opacity="0.6" />

      {/* Shaft */}
      <rect x="18" y="6" width="4" height="10" fill="#64748b" />

      {/* Propeller (spins continuously while powered, using Tailwind's animate-spin keyframe) */}
      <g
        transform="translate(20, 6)"
        className={isSpinning ? "animate-spin" : undefined}
        style={isSpinning ? { animationDuration: `${spinDurationS}s`, transformOrigin: "0px 0px" } : undefined}
      >
        <ellipse cx="0" cy="0" rx="16" ry="3.5" fill="#fbbf24" opacity="0.9" />
        <ellipse cx="0" cy="0" rx="3.5" ry="16" fill="#fbbf24" opacity="0.9" />
        <circle cx="0" cy="0" r="2.5" fill="#78350f" />
      </g>

      {/* Leads */}
      <path d="M 20 40 L 20 54" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 40 40 L 40 54" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

      {/* Pin: + (power) */}
      <g
        transform="translate(20, 60)"
        onMouseEnter={() => onPinHover?.("+")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("+")}
        className="cursor-pointer group"
      >
        <circle cx="0" cy="0" r="4" fill={highlightedPin === "+" ? "#38bdf8" : "#0f172a"} stroke={highlightedPin === "+" ? "#0284c7" : "#ef4444"} strokeWidth="1.2" />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-3" y="10" fontSize="5" fill="#ef4444" fontFamily="monospace">+</text>
      </g>

      {/* Pin: - (ground) */}
      <g
        transform="translate(40, 60)"
        onMouseEnter={() => onPinHover?.("-")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("-")}
        className="cursor-pointer group"
      >
        <circle cx="0" cy="0" r="4" fill={highlightedPin === "-" ? "#38bdf8" : "#0f172a"} stroke={highlightedPin === "-" ? "#0284c7" : "#94a3b8"} strokeWidth="1.2" />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-3" y="10" fontSize="5" fill="#94a3b8" fontFamily="monospace">-</text>
      </g>
    </g>
  );
};
