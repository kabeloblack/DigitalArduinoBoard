import React from "react";
import { PinDefinition } from "../../types/circuit";

interface ArduinoUnoProps {
  x: number;
  y: number;
  highlightedPin?: string | null;
  activePins?: Record<string, number>;
  onPinHover?: (pinId: string | null) => void;
  onPinClick?: (pinId: string) => void;
}

export const ARDUINO_UNO_PINS: PinDefinition[] = [
  // Top digital header (D0-D13, GND, AREF)
  // Uno width is approx 180, height 120 (dimensions 140x100px base in spec, canvas scaled for clarity)
  { id: "AREF", label: "AREF", offsetX: 74, offsetY: 8, type: "passive" },
  { id: "GND.3", label: "GND", offsetX: 82, offsetY: 8, type: "ground" },
  { id: "D13", label: "13", offsetX: 90, offsetY: 8, type: "digital" },
  { id: "D12", label: "12", offsetX: 98, offsetY: 8, type: "digital" },
  { id: "D11", label: "~11", offsetX: 106, offsetY: 8, type: "digital" },
  { id: "D10", label: "~10", offsetX: 114, offsetY: 8, type: "digital" },
  { id: "D9", label: "~9", offsetX: 122, offsetY: 8, type: "digital" },
  { id: "D8", label: "8", offsetX: 130, offsetY: 8, type: "digital" },

  { id: "D7", label: "7", offsetX: 142, offsetY: 8, type: "digital" },
  { id: "D6", label: "~6", offsetX: 150, offsetY: 8, type: "digital" },
  { id: "D5", label: "~5", offsetX: 158, offsetY: 8, type: "digital" },
  { id: "D4", label: "4", offsetX: 166, offsetY: 8, type: "digital" },
  { id: "D3", label: "~3", offsetX: 174, offsetY: 8, type: "digital" },
  { id: "D2", label: "2", offsetX: 182, offsetY: 8, type: "digital" },
  { id: "D1", label: "TX>1", offsetX: 190, offsetY: 8, type: "digital" },
  { id: "D0", label: "RX<0", offsetX: 198, offsetY: 8, type: "digital" },

  // Bottom power & analog header
  { id: "IOREF", label: "IOREF", offsetX: 82, offsetY: 132, type: "power" },
  { id: "RESET", label: "RESET", offsetX: 90, offsetY: 132, type: "signal" },
  { id: "3.3V", label: "3.3V", offsetX: 98, offsetY: 132, type: "power", voltage: 3.3 },
  { id: "5V", label: "5V", offsetX: 106, offsetY: 132, type: "power", voltage: 5 },
  { id: "GND.1", label: "GND", offsetX: 114, offsetY: 132, type: "ground" },
  { id: "GND.2", label: "GND", offsetX: 122, offsetY: 132, type: "ground" },
  { id: "VIN", label: "VIN", offsetX: 130, offsetY: 132, type: "power" },

  { id: "A0", label: "A0", offsetX: 146, offsetY: 132, type: "analog" },
  { id: "A1", label: "A1", offsetX: 154, offsetY: 132, type: "analog" },
  { id: "A2", label: "A2", offsetX: 162, offsetY: 132, type: "analog" },
  { id: "A3", label: "A3", offsetX: 170, offsetY: 132, type: "analog" },
  { id: "A4", label: "A4", offsetX: 178, offsetY: 132, type: "analog" },
  { id: "A5", label: "A5", offsetX: 186, offsetY: 132, type: "analog" },
];

export const ArduinoUno: React.FC<ArduinoUnoProps> = ({
  x,
  y,
  highlightedPin,
  activePins = {},
  onPinHover,
  onPinClick,
}) => {
  return (
    <g transform={`translate(${x}, ${y})`} className="select-none cursor-default">
      {/* Board Drop Shadow */}
      <rect
        x="6"
        y="6"
        width="210"
        height="140"
        rx="8"
        fill="rgba(0, 0, 0, 0.25)"
        filter="blur(4px)"
      />

      {/* Main PCB (Arduino Teal / Deep Blue) */}
      <rect
        x="0"
        y="0"
        width="210"
        height="140"
        rx="6"
        fill="#008184"
        stroke="#006567"
        strokeWidth="1.5"
      />

      {/* Mounting Holes */}
      <circle cx="12" cy="12" r="4.5" fill="#f4efe6" stroke="#005355" strokeWidth="1" />
      <circle cx="12" cy="12" r="2.8" fill="#1e293b" />
      <circle cx="12" cy="128" r="4.5" fill="#f4efe6" stroke="#005355" strokeWidth="1" />
      <circle cx="12" cy="128" r="2.8" fill="#1e293b" />
      <circle cx="198" cy="40" r="4.5" fill="#f4efe6" stroke="#005355" strokeWidth="1" />
      <circle cx="198" cy="40" r="2.8" fill="#1e293b" />
      <circle cx="198" cy="100" r="4.5" fill="#f4efe6" stroke="#005355" strokeWidth="1" />
      <circle cx="198" cy="100" r="2.8" fill="#1e293b" />

      {/* USB Type-B Port (Silver Metal) */}
      <g transform="translate(-8, 14)">
        <rect x="0" y="0" width="34" height="26" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
        <rect x="4" y="4" width="26" height="18" fill="#cbd5e1" />
        <rect x="10" y="8" width="14" height="10" rx="1" fill="#1e293b" />
      </g>

      {/* DC Barrel Power Jack */}
      <g transform="translate(-10, 88)">
        <rect x="0" y="0" width="38" height="30" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <rect x="30" y="6" width="6" height="18" fill="#475569" />
        <circle cx="16" cy="15" r="4" fill="#64748b" />
      </g>

      {/* Reset Button (Red / Cream) */}
      <g transform="translate(42, 14)">
        <rect x="0" y="0" width="12" height="12" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.5" />
        <circle cx="6" cy="6" r="3.5" fill="#dc2626" />
      </g>

      {/* Crystal Oscillator (Silver Oval) */}
      <g transform="translate(56, 50)">
        <rect x="0" y="0" width="18" height="8" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
        <text x="9" y="6" fontSize="4.5" textAnchor="middle" fill="#64748b" fontFamily="monospace">
          16.000
        </text>
      </g>

      {/* ATmega328P DIP IC (Black Dual In-Line Chip with 28 legs) */}
      <g transform="translate(100, 52)">
        <rect x="0" y="0" width="70" height="34" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        {/* Chip Notch */}
        <path d="M 0 13 A 4 4 0 0 1 0 21" fill="none" stroke="#475569" strokeWidth="1" />
        {/* Silkscreen text on chip */}
        <text x="35" y="16" fontSize="6.5" textAnchor="middle" fill="#94a3b8" fontWeight="bold" fontFamily="sans-serif">
          ATMEGA328P-PU
        </text>
        <text x="35" y="24" fontSize="4.5" textAnchor="middle" fill="#64748b" fontFamily="monospace">
          ARDUINO UNO
        </text>
        {/* DIP Pins top and bottom */}
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i}>
            <rect x={5 + i * 4.4} y="-3" width="2" height="4" fill="#94a3b8" />
            <rect x={5 + i * 4.4} y="33" width="2" height="4" fill="#94a3b8" />
          </g>
        ))}
      </g>

      {/* SMD Status LEDs: ON (Green) & L / D13 (Orange/Yellow) */}
      <g transform="translate(52, 74)">
        {/* ON LED */}
        <rect x="0" y="0" width="5" height="4" rx="0.5" fill="#15803d" />
        <circle cx="2.5" cy="2" r="1.5" fill="#22c55e" />
        <text x="8" y="3.5" fontSize="4" fill="#e2e8f0" fontFamily="sans-serif" fontWeight="bold">
          ON
        </text>

        {/* L (D13) LED */}
        <rect x="0" y="10" width="5" height="4" rx="0.5" fill={activePins["13"] ? "#f59e0b" : "#78350f"} />
        <circle cx="2.5" cy="12" r="1.5" fill={activePins["13"] ? "#fbbf24" : "#451a03"} />
        <text x="8" y="13.5" fontSize="4" fill="#e2e8f0" fontFamily="sans-serif" fontWeight="bold">
          L
        </text>

        {/* TX/RX LEDs */}
        <rect x="0" y="20" width="5" height="4" rx="0.5" fill="#1e293b" />
        <text x="8" y="23.5" fontSize="4" fill="#94a3b8" fontFamily="sans-serif">
          TX
        </text>
        <rect x="0" y="28" width="5" height="4" rx="0.5" fill="#1e293b" />
        <text x="8" y="31.5" fontSize="4" fill="#94a3b8" fontFamily="sans-serif">
          RX
        </text>
      </g>

      {/* Silkscreen Board Branding */}
      <text x="135" y="35" fontSize="10" fontWeight="900" fill="#ffffff" fontFamily="sans-serif" letterSpacing="0.5">
        ARDUINO
      </text>
      <text x="182" y="35" fontSize="7" fontWeight="bold" fill="#f59e0b" fontFamily="sans-serif">
        UNO
      </text>
      <path
        d="M 125 32 C 122 30, 118 30, 115 32 C 112 34, 112 37, 115 39 C 118 41, 122 41, 125 39 C 128 41, 132 41, 135 39"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
      />

      {/* Digital Pins Header Strip (Black Bar) */}
      <rect x="70" y="3" width="134" height="11" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
      <text x="136" y="22" fontSize="5" fill="#ffffff" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
        DIGITAL (PWM ~)
      </text>

      {/* Power & Analog Header Strip (Black Bar) */}
      <rect x="78" y="126" width="56" height="11" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
      <text x="106" y="123" fontSize="5" fill="#ffffff" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
        POWER
      </text>

      <rect x="142" y="126" width="48" height="11" rx="1.5" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
      <text x="166" y="123" fontSize="5" fill="#ffffff" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
        ANALOG IN
      </text>

      {/* Pin Sockets & Labels */}
      {ARDUINO_UNO_PINS.map((pin) => {
        const isHighlight = highlightedPin === pin.id || (highlightedPin?.startsWith("GND") && pin.id.startsWith("GND"));
        const isActive = pin.id.startsWith("D") && activePins[pin.id.replace("D", "")];

        return (
          <g
            key={pin.id}
            transform={`translate(${pin.offsetX}, ${pin.offsetY})`}
            onMouseEnter={() => onPinHover?.(pin.id)}
            onMouseLeave={() => onPinHover?.(null)}
            onClick={() => onPinClick?.(pin.id)}
            className="cursor-pointer group"
          >
            {/* Outer socket metal ring */}
            <rect
              x="-3"
              y="-3"
              width="6"
              height="6"
              rx="1"
              fill={isHighlight ? "#38bdf8" : isActive ? "#22c55e" : "#1e293b"}
              stroke={isHighlight ? "#0284c7" : "#475569"}
              strokeWidth="0.8"
            />
            {/* Inner pin hole */}
            <rect x="-1.4" y="-1.4" width="2.8" height="2.8" rx="0.5" fill="#020617" />

            {/* Pin Text Label */}
            <text
              x="0"
              y={pin.offsetY < 50 ? -5 : 10}
              fontSize="4.2"
              fontWeight={isHighlight ? "bold" : "normal"}
              textAnchor="middle"
              fill={isHighlight ? "#38bdf8" : pin.type === "power" ? "#f87171" : pin.type === "ground" ? "#cbd5e1" : "#e2e8f0"}
              fontFamily="monospace"
              className="pointer-events-none"
            >
              {pin.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
