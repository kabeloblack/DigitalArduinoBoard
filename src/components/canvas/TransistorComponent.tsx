import React from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";

interface TransistorComponentProps {
  component: CircuitComponent;
  isConducting?: boolean;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
}

export const TransistorComponent: React.FC<TransistorComponentProps> = ({
  component,
  isConducting,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const width = item?.width ?? 44;
  const height = item?.height ?? 46;
  const pins: PinDefinition[] = item?.pins ?? [];

  return (
    <g transform={`translate(${component.x}, ${component.y})`} className="select-none">
      <text x={width / 2} y={-8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
        {component.id}
      </text>

      {/* Leads */}
      {pins.map((pin) => (
        <path key={`lead-${pin.id}`} d={`M ${pin.offsetX} ${pin.offsetY} L ${pin.offsetX} ${height * 0.55}`} stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
      ))}

      {/* Conducting glow */}
      {isConducting && (
        <circle cx={width / 2} cy={height * 0.32} r={width / 2 + 2} fill="rgba(34,197,94,0.35)" filter="blur(4px)" />
      )}

      {/* TO-92 package body */}
      <path
        d={`M ${width * 0.1} ${height * 0.55} A ${width * 0.4} ${width * 0.4} 0 1 1 ${width * 0.9} ${height * 0.55} Z`}
        fill={isConducting ? "#166534" : "#334155"}
        stroke={isConducting ? "#4ade80" : "#94a3b8"}
        strokeWidth={1}
        className="transition-colors duration-150"
      />
      <text x={width / 2} y={height * 0.4} fontSize="7" fill="#f8fafc" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
        NPN
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
            <circle cx={0} cy={0} r={6} fill="transparent" />
            <circle
              cx={0}
              cy={0}
              r={isHighlighted ? 4 : 2.5}
              fill={isHighlighted ? "#38bdf8" : pin.type === "power" ? "#ef4444" : pin.type === "ground" ? "#334155" : "#fbbf24"}
              stroke={isHighlighted ? "#ffffff" : "#0f172a"}
              strokeWidth={isHighlighted ? 1.2 : 0.8}
            />
            <text x={0} y={12} fontSize="6" fill="#64748b" textAnchor="middle" fontFamily="monospace" className="pointer-events-none">
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
