import React from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";

interface CapacitorComponentProps {
  component: CircuitComponent;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
}

export const CapacitorComponent: React.FC<CapacitorComponentProps> = ({
  component,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const width = item?.width ?? 40;
  const height = item?.height ?? 44;
  const pins: PinDefinition[] = item?.pins ?? [];
  const isElectrolytic = component.type === "passive:capacitor-electrolytic";
  const value = component.properties?.value ?? (isElectrolytic ? "100uF" : "100nF");

  return (
    <g transform={`translate(${component.x}, ${component.y})`} className="select-none">
      <text x={width / 2} y={-8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
        {component.id} ({value})
      </text>

      {/* Leads */}
      <path d={`M ${pins[0]?.offsetX ?? 0} ${height - 4} L ${pins[0]?.offsetX ?? 0} ${height - 16}`} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d={`M ${pins[1]?.offsetX ?? width} ${height - 4} L ${pins[1]?.offsetX ?? width} ${height - 16}`} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

      {isElectrolytic ? (
        <>
          {/* Cylindrical electrolytic can */}
          <rect x={2} y={4} width={width - 4} height={height - 20} rx={width / 2 - 2} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1} />
          <rect x={2} y={4} width={width - 4} height={10} rx={(width - 4) / 2} fill="#3b82f6" opacity={0.3} />
          {/* Polarity stripe on the negative side */}
          <rect x={width - 12} y={4} width={4} height={height - 20} fill="#f8fafc" opacity={0.85} />
          <text x={width - 10} y={height - 24} fontSize="8" fill="#f8fafc" textAnchor="middle" fontFamily="monospace">
            -
          </text>
        </>
      ) : (
        <>
          {/* Ceramic disc */}
          <ellipse cx={width / 2} cy={height / 2 - 6} rx={width / 2 - 3} ry={height / 2 - 10} fill="#fbbf24" stroke="#b45309" strokeWidth={1.2} />
          <ellipse cx={width / 2} cy={height / 2 - 6} rx={width / 2 - 8} ry={height / 2 - 15} fill="#f59e0b" opacity={0.5} />
        </>
      )}

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
              r={isHighlighted ? 3.5 : 2}
              fill={isHighlighted ? "#38bdf8" : "#94a3b8"}
              stroke={isHighlighted ? "#ffffff" : "#0f172a"}
              strokeWidth={isHighlighted ? 1.2 : 0.6}
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
