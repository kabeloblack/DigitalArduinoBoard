import React from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";

interface DiodeComponentProps {
  component: CircuitComponent;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
}

export const DiodeComponent: React.FC<DiodeComponentProps> = ({
  component,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const width = item?.width ?? 50;
  const height = item?.height ?? 24;
  const pins: PinDefinition[] = item?.pins ?? [];
  const midY = height / 2;

  return (
    <g transform={`translate(${component.x}, ${component.y})`} className="select-none">
      <text x={width / 2} y={-8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
        {component.id}
      </text>

      {/* Leads */}
      <path d={`M 0 ${midY} L ${width} ${midY}`} stroke="#94a3b8" strokeWidth="1.5" />

      {/* Diode body: triangle (anode) pointing at a bar (cathode) - conducts A -> K */}
      <polygon points={`${width * 0.32},${midY - 8} ${width * 0.32},${midY + 8} ${width * 0.62},${midY}`} fill="#334155" stroke="#94a3b8" strokeWidth={1} />
      <rect x={width * 0.62} y={midY - 8} width={3} height={16} fill="#f8fafc" />

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
            <circle cx={0} cy={0} r={6} fill="transparent" />
            <circle
              cx={0}
              cy={0}
              r={isHighlighted ? 4 : 2.5}
              fill={isHighlighted ? "#38bdf8" : "#94a3b8"}
              stroke={isHighlighted ? "#ffffff" : "#0f172a"}
              strokeWidth={isHighlighted ? 1.2 : 0.8}
            />
            <text
              x={0}
              y={pin.id === "A" ? 16 : 16}
              fontSize="6"
              fill="#64748b"
              textAnchor="middle"
              fontFamily="monospace"
              className="pointer-events-none"
            >
              {pin.label}
            </text>
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
