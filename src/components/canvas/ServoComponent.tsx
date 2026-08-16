import React from "react";

interface ServoComponentProps {
  id: string;
  x: number;
  y: number;
  angle?: number; // 0 - 180 degrees
  highlightedPin?: string | null;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
}

export const ServoComponent: React.FC<ServoComponentProps> = ({
  id,
  x,
  y,
  angle = 90,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  // Clamped angle between 0 and 180
  const currentAngle = Math.max(0, Math.min(180, angle));

  return (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      {/* Component ID & Angle Badge */}
      <rect x="-10" y="-36" width="70" height="16" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
      <text x="25" y="-25" fontSize="6.5" fill="#cbd5e1" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        {id} ({Math.round(currentAngle)}°)
      </text>

      {/* Servo Body (SG90 Blue Translucent Casing) */}
      {/* Mounting Wings */}
      <rect x="-6" y="22" width="62" height="6" rx="1.5" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
      <circle cx="-2" cy="25" r="1.5" fill="#e2e8f0" />
      <circle cx="52" cy="25" r="1.5" fill="#e2e8f0" />

      {/* Main Motor Housing Box */}
      <rect x="4" y="10" width="42" height="34" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
      <rect x="8" y="14" width="34" height="26" fill="#0ea5e9" opacity="0.85" />

      {/* Gear Cylinder Base */}
      <circle cx="20" cy="24" r="12" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
      <circle cx="20" cy="24" r="8" fill="#38bdf8" />
      <circle cx="20" cy="24" r="4" fill="#0f172a" />

      {/* Rotating Servo Horn (White Plastic Arm) */}
      <g
        transform={`translate(20, 24) rotate(${currentAngle - 90})`}
        className="transition-transform duration-100 ease-out"
      >
        {/* Double-sided or single cross arm */}
        <rect x="-4" y="-24" width="8" height="32" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="2.5" fill="#475569" />
        {/* Arm link holes */}
        <circle cx="0" cy="-18" r="1.2" fill="#64748b" />
        <circle cx="0" cy="-12" r="1.2" fill="#64748b" />
        <circle cx="0" cy="-6" r="1.2" fill="#64748b" />
      </g>

      {/* 3-Wire Ribbon Cable Leads (PWM Orange/Yellow, VCC Red, GND Brown/Black) */}
      <path d="M 12 44 L 12 60" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 25 44 L 25 60" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 38 44 L 38 60" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

      {/* Pin 1: PWM (Signal) at (12, 60) */}
      <g
        transform="translate(12, 60)"
        onMouseEnter={() => onPinHover?.("pwm")}
        onMouseLeave={() => onPinHover?.(null)}
        onClick={() => onPinClick?.("pwm")}
        className="cursor-pointer group"
      >
        <circle
          cx="0"
          cy="0"
          r="4"
          fill={highlightedPin === "pwm" ? "#38bdf8" : "#0f172a"}
          stroke={highlightedPin === "pwm" ? "#0284c7" : "#f59e0b"}
          strokeWidth="1.2"
        />
        <circle cx="0" cy="0" r="1.5" fill="#f8fafc" />
        <text x="-4" y="10" fontSize="5" fill="#f59e0b" fontFamily="monospace">
          PWM
        </text>
      </g>

      {/* Pin 2: VCC (Power) at (25, 60) */}
      <g
        transform="translate(25, 60)"
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
          VCC
        </text>
      </g>

      {/* Pin 3: GND (Ground) at (38, 60) */}
      <g
        transform="translate(38, 60)"
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
          GND
        </text>
      </g>
    </g>
  );
};
