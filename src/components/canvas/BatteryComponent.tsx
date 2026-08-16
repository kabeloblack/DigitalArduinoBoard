import React from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";

interface BatteryComponentProps {
  component: CircuitComponent;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
}

export const BatteryComponent: React.FC<BatteryComponentProps> = ({
  component,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const width = item?.width ?? 54;
  const height = item?.height ?? 74;
  const pins: PinDefinition[] = item?.pins ?? [];

  return (
    <g transform={`translate(${component.x}, ${component.y})`} className="select-none">
      <text x={width / 2} y={-8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
        {component.id}
      </text>

      {/* Snap connector leads */}
      <path d={`M ${width * 0.3} 10 L ${width * 0.3} 0`} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <path d={`M ${width * 0.7} 10 L ${width * 0.7} 0`} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

      {/* Battery body */}
      <rect x={4} y={10} width={width - 8} height={height - 10} rx={3} fill="#1e293b" stroke="#475569" strokeWidth={1} />
      <rect x={8} y={16} width={width - 16} height={height - 26} rx={2} fill="#334155" />
      <text x={width / 2} y={height / 2 + 4} fontSize="9" fill="#f8fafc" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
        9V
      </text>

      {pins.map((pin) => {
        const isHighlighted = highlightedPin === pin.id || highlightedPin?.toLowerCase() === pin.label.toLowerCase();
        return (
          <g
            key={pin.id}
            transform={`translate(${pin.offsetX}, ${pin.offsetY})`}
            onMouseEnter={() => onPinHover(pin.id)}
            onMouseLeave={() => onPinHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pin.id);
            }}
            className="cursor-pointer group/pin"
          >
            <circle cx={0} cy={0} r={7} fill="transparent" />
            <circle
              cx={0}
              cy={0}
              r={isHighlighted ? 4 : 2.5}
              fill={isHighlighted ? "#38bdf8" : pin.type === "power" ? "#ef4444" : "#334155"}
              stroke={isHighlighted ? "#ffffff" : "#94a3b8"}
              strokeWidth={isHighlighted ? 1.2 : 0.8}
            />
            {isHighlighted && (
              <g transform="translate(0, -12)" className="pointer-events-none">
                <rect x={-pin.label.length * 3 - 4} y={-9} width={pin.label.length * 6 + 8} height={12} rx={2} fill="#0f172a" stroke="#38bdf8" strokeWidth={1} />
                <text x={0} y={0} fill="#f8fafc" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {pin.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
