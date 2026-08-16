import React, { useRef, useEffect } from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";

interface GenericWokwiComponentProps {
  component: CircuitComponent;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
  liveState?: Record<string, any>;
}

export const GenericWokwiComponent: React.FC<GenericWokwiComponentProps> = ({
  component,
  highlightedPin,
  onPinHover,
  onPinClick,
  liveState = {},
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = item?.width || 100;
  const height = item?.height || 100;
  const pins: PinDefinition[] = item?.pins || [];
  const wokwiTag = item?.wokwiTag || "wokwi-resistor";

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";

    try {
      const el = document.createElement(wokwiTag);

      // Attributes
      if (component.properties.color) {
        el.setAttribute("color", component.properties.color);
      }
      if (component.properties.value) {
        el.setAttribute("value", component.properties.value);
      }
      if (component.properties.digits) {
        el.setAttribute("digits", component.properties.digits);
      }
      if (component.properties.text) {
        el.setAttribute("text", component.properties.text);
      }
      if (component.properties.temperature !== undefined) {
        el.setAttribute("temperature", String(component.properties.temperature));
      }
      if (component.properties.humidity !== undefined) {
        el.setAttribute("humidity", String(component.properties.humidity));
      }
      if (component.properties.distance !== undefined) {
        el.setAttribute("distance", String(component.properties.distance));
      }

      // Live state bindings
      if (liveState.potValue !== undefined) {
        (el as any).value = liveState.potValue;
      }
      if (liveState.servoAngle !== undefined) {
        (el as any).angle = liveState.servoAngle;
      }
      if (liveState.isOn !== undefined) {
        (el as any).value = liveState.isOn ? 1 : 0;
      }
      if (liveState.isPressed !== undefined) {
        (el as any).pressed = !!liveState.isPressed;
      }
      if (liveState.lcdText !== undefined) {
        (el as any).text = liveState.lcdText;
      }
      if (liveState.neoPixels !== undefined) {
        const pixels: Array<{ r: number; g: number; b: number }> = liveState.neoPixels;
        // wokwi-elements NeoPixel components take r/g/b as 0-1 floats, not 0-255.
        const norm = (p: { r: number; g: number; b: number }) => ({
          r: p.r / 255,
          g: p.g / 255,
          b: p.b / 255,
        });
        if (component.type === "display:neopixel") {
          const p = norm(pixels[0] ?? { r: 0, g: 0, b: 0 });
          (el as any).r = p.r;
          (el as any).g = p.g;
          (el as any).b = p.b;
        } else if (component.type === "display:neopixel-matrix" && typeof (el as any).setPixel === "function") {
          const cols = Number(component.properties.cols) || 8;
          pixels.forEach((pixel, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            (el as any).setPixel(row, col, norm(pixel));
          });
        } else if (component.type === "display:neopixel-ring" && typeof (el as any).setPixel === "function") {
          pixels.forEach((pixel, i) => {
            (el as any).setPixel(i, norm(pixel));
          });
        }
      }

      el.style.width = "100%";
      el.style.height = "100%";
      el.style.display = "block";
      el.style.pointerEvents = "none";
      el.style.userSelect = "none";

      container.appendChild(el);
    } catch (err) {
      console.warn("Failed to mount Wokwi canvas element:", wokwiTag, err);
    }

    return () => {
      container.innerHTML = "";
    };
  }, [wokwiTag, JSON.stringify(component.properties), JSON.stringify(liveState)]);

  return (
    <g transform={`translate(${component.x}, ${component.y})`}>
      {/* Component Title Label */}
      <text
        x={width / 2}
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

      {/* Render the Wokwi Web Component in SVG foreignObject */}
      <foreignObject x={0} y={0} width={width} height={height} className="overflow-visible">
        <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
      </foreignObject>

      {/* Interactive Pin Plug Overlay Hotspots */}
      {pins.map((pin) => {
        const isHighlighted =
          highlightedPin === pin.id ||
          highlightedPin?.toLowerCase() === pin.label.toLowerCase();

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
            {/* Magnetic Outer Catch Target */}
            <circle cx={0} cy={0} r={9} fill="transparent" />

            {/* Pin Outer Ring */}
            <circle
              cx={0}
              cy={0}
              r={isHighlighted ? 6 : 4}
              fill={isHighlighted ? "#38bdf8" : "#1e293b"}
              stroke={
                isHighlighted
                  ? "#ffffff"
                  : pin.type === "power"
                  ? "#ef4444"
                  : pin.type === "ground"
                  ? "#334155"
                  : pin.type === "analog"
                  ? "#38bdf8"
                  : "#fbbf24"
              }
              strokeWidth={isHighlighted ? 2 : 1.5}
              className="transition-all duration-150 shadow-sm"
            />

            {/* Inner Metallic Core */}
            <circle
              cx={0}
              cy={0}
              r={1.5}
              fill={isHighlighted ? "#ffffff" : "#94a3b8"}
            />

            {/* Pin Tooltip / Tag on Hover */}
            {isHighlighted && (
              <g transform="translate(0, -14)" className="pointer-events-none">
                <rect
                  x={-pin.label.length * 3.5 - 6}
                  y={-10}
                  width={pin.label.length * 7 + 12}
                  height={14}
                  rx={3}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={0}
                  fill="#f8fafc"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
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
