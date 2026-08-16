import React from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";
import {
  BB_WIDTH,
  BB_HEIGHT,
  RAIL_TOP_PLUS_Y,
  RAIL_TOP_MINUS_Y,
  RAIL_BOT_PLUS_Y,
  RAIL_BOT_MINUS_Y,
  CENTER_GAP_Y,
} from "../../services/breadboard";

interface BreadboardComponentProps {
  component: CircuitComponent;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
}

export const BreadboardComponent: React.FC<BreadboardComponentProps> = ({
  component,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const pins: PinDefinition[] = item?.pins || [];

  const holeColor = (pin: PinDefinition) => {
    if (pin.type === "power") return "#fca5a5";
    if (pin.type === "ground") return "#93c5fd";
    return "#1e293b";
  };

  return (
    <g transform={`translate(${component.x}, ${component.y})`} className="select-none">
      <text
        x={BB_WIDTH / 2}
        y={-8}
        fill="#94a3b8"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="middle"
        className="pointer-events-none select-none"
      >
        {component.id}
      </text>

      {/* Board body */}
      <rect x={0} y={0} width={BB_WIDTH} height={BB_HEIGHT} rx={6} fill="#e7e0cf" stroke="#a8a08a" strokeWidth={1} />

      {/* Power rail stripes */}
      <rect x={6} y={RAIL_TOP_PLUS_Y - 3} width={BB_WIDTH - 12} height={1.5} fill="#ef4444" opacity={0.6} />
      <rect x={6} y={RAIL_TOP_MINUS_Y - 3} width={BB_WIDTH - 12} height={1.5} fill="#3b82f6" opacity={0.6} />
      <rect x={6} y={RAIL_BOT_PLUS_Y - 3} width={BB_WIDTH - 12} height={1.5} fill="#ef4444" opacity={0.6} />
      <rect x={6} y={RAIL_BOT_MINUS_Y - 3} width={BB_WIDTH - 12} height={1.5} fill="#3b82f6" opacity={0.6} />

      {/* Center gap groove */}
      <rect x={4} y={CENTER_GAP_Y - 3} width={BB_WIDTH - 8} height={6} fill="#d6cdb4" />

      {/* Holes */}
      {pins.map((pin) => {
        const isHighlighted =
          highlightedPin === pin.id || highlightedPin?.toLowerCase() === pin.label.toLowerCase();
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
            <circle cx={0} cy={0} r={5} fill="transparent" />
            <circle
              cx={0}
              cy={0}
              r={isHighlighted ? 3.5 : 1.8}
              fill={isHighlighted ? "#38bdf8" : holeColor(pin)}
              stroke={isHighlighted ? "#ffffff" : "none"}
              strokeWidth={isHighlighted ? 1.2 : 0}
              className="transition-all duration-100"
            />
            {isHighlighted && (
              <g transform="translate(0, -10)" className="pointer-events-none">
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
