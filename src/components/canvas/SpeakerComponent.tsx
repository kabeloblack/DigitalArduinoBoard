import React from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";

interface SpeakerComponentProps {
  component: CircuitComponent;
  isBuzzing?: boolean;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
}

export const SpeakerComponent: React.FC<SpeakerComponentProps> = ({
  component,
  isBuzzing,
  highlightedPin,
  onPinHover,
  onPinClick,
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const width = item?.width ?? 70;
  const height = item?.height ?? 70;
  const pins: PinDefinition[] = item?.pins ?? [];
  const cx = width / 2;
  const cy = height / 2 - 3;

  return (
    <g transform={`translate(${component.x}, ${component.y})`} className="select-none">
      <text x={cx} y={-8} fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">
        {component.id}
      </text>

      {pins.map((pin) => (
        <path key={`lead-${pin.id}`} d={`M ${pin.offsetX} ${pin.offsetY} L ${pin.offsetX} ${height - 12}`} stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
      ))}

      {isBuzzing && <circle cx={cx} cy={cy} r={width / 2 + 3} fill="rgba(234,179,8,0.3)" filter="blur(4px)" className="animate-pulse" />}

      {/* Speaker magnet housing */}
      <circle cx={cx} cy={cy} r={width / 2 - 2} fill="#334155" stroke="#64748b" strokeWidth={1.2} />
      {/* Cone */}
      <circle cx={cx} cy={cy} r={width / 2 - 10} fill="#1e293b" stroke="#475569" strokeWidth={0.8} />
      <circle cx={cx} cy={cy} r={width / 2 - 20} fill={isBuzzing ? "#eab308" : "#334155"} className="transition-colors duration-100" />
      <circle cx={cx} cy={cy} r={3} fill="#0f172a" />

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
              fill={isHighlighted ? "#38bdf8" : pin.type === "ground" ? "#334155" : "#ef4444"}
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
