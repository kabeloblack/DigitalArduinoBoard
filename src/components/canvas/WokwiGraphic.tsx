import React, { useRef, useEffect } from "react";
import { ComponentType } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";

interface WokwiGraphicProps {
  idType: ComponentType;
  properties?: Record<string, any>;
  className?: string;
  interactive?: boolean;
}

export const WokwiGraphic: React.FC<WokwiGraphicProps> = ({
  idType,
  properties = {},
  className = "w-full h-full",
  interactive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const item = getWokwiItem(idType, properties);
  const wokwiTag = item?.wokwiTag || "wokwi-resistor";
  // These parts have no @wokwi/elements custom element backing them - they're hand-drawn
  // React/SVG components (see BreadboardComponent.tsx / DcMotorComponent.tsx /
  // CameraComponent.tsx / etc.) rendered directly on the canvas, so the tray preview
  // uses a static icon instead.
  const isCamera = idType === "input:camera-arducam" || idType === "input:camera-ov7670";
  const isCapacitor = idType === "passive:capacitor-ceramic" || idType === "passive:capacitor-electrolytic";
  const CUSTOM_RENDERED_TYPES = new Set<ComponentType>([
    "tool:breadboard",
    "output:dc-motor",
    "power:battery-9v",
    "passive:diode",
    "passive:transistor-npn",
    "output:speaker",
  ]);
  const isCustomRendered = isCamera || isCapacitor || CUSTOM_RENDERED_TYPES.has(idType);

  useEffect(() => {
    if (!containerRef.current || isCustomRendered) return;
    const container = containerRef.current;
    container.innerHTML = "";

    try {
      const el = document.createElement(wokwiTag);

      // Set component attributes/properties based on type & props
      if (properties.color) {
        el.setAttribute("color", properties.color);
      }
      if (properties.value) {
        el.setAttribute("value", properties.value);
      }
      if (properties.digits) {
        el.setAttribute("digits", properties.digits);
      }
      if (properties.text) {
        el.setAttribute("text", properties.text);
      }
      if (properties.temperature !== undefined) {
        el.setAttribute("temperature", String(properties.temperature));
      }
      if (properties.humidity !== undefined) {
        el.setAttribute("humidity", String(properties.humidity));
      }
      if (properties.distance !== undefined) {
        el.setAttribute("distance", String(properties.distance));
      }
      if (properties.potValue !== undefined) {
        (el as any).value = properties.potValue;
      }
      if (properties.servoAngle !== undefined) {
        (el as any).angle = properties.servoAngle;
      }

      // Add responsive and centering styling
      el.style.display = "block";
      el.style.maxWidth = "100%";
      el.style.maxHeight = "100%";
      el.style.pointerEvents = interactive ? "auto" : "none";
      el.style.userSelect = "none";

      container.appendChild(el);
    } catch (err) {
      console.warn("Failed to mount Wokwi element:", wokwiTag, err);
    }

    return () => {
      container.innerHTML = "";
    };
  }, [idType, wokwiTag, JSON.stringify(properties), interactive, isCustomRendered]);

  if (isCustomRendered) {
    return (
      <div className={`flex items-center justify-center overflow-hidden ${className}`}>
        {idType === "tool:breadboard" ? (
          <svg viewBox="0 0 60 40" className="w-full h-full max-h-[70px]">
            <rect x="2" y="2" width="56" height="36" rx="3" fill="#e7e0cf" stroke="#a8a08a" strokeWidth="1" />
            <rect x="5" y="7" width="50" height="1.2" fill="#ef4444" opacity="0.6" />
            <rect x="5" y="10" width="50" height="1.2" fill="#3b82f6" opacity="0.6" />
            <rect x="5" y="28" width="50" height="1.2" fill="#ef4444" opacity="0.6" />
            <rect x="5" y="31" width="50" height="1.2" fill="#3b82f6" opacity="0.6" />
            <rect x="3" y="18.5" width="54" height="3" fill="#d6cdb4" />
            {Array.from({ length: 14 }).map((_, col) =>
              [14, 22].map((rowY) =>
                Array.from({ length: 2 }).map((_, dy) => (
                  <circle key={`${col}-${rowY}-${dy}`} cx={6 + col * 3.6} cy={rowY + dy * 3} r="0.5" fill="#1e293b" />
                ))
              )
            )}
          </svg>
        ) : isCamera ? (
          <svg viewBox="0 0 60 60" className="w-full h-full max-h-[70px]">
            <rect x="8" y="8" width="44" height="44" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <circle cx="30" cy="28" r="16" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="30" cy="28" r="11" fill="#164e63" stroke="#0ea5e9" strokeWidth="1" opacity="0.8" />
            <circle cx="25" cy="23" r="3" fill="#7dd3fc" opacity="0.6" />
            <circle cx="42" cy="14" r="2.5" fill="#f472b6" />
          </svg>
        ) : idType === "output:dc-motor" ? (
          <svg viewBox="0 0 60 60" className="w-full h-full max-h-[70px]">
            <rect x="16" y="24" width="28" height="22" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
            <rect x="28" y="10" width="4" height="14" fill="#64748b" />
            <ellipse cx="30" cy="10" rx="14" ry="3" fill="#fbbf24" opacity="0.9" />
            <ellipse cx="30" cy="10" rx="3" ry="14" fill="#fbbf24" opacity="0.9" />
            <circle cx="30" cy="10" r="2.2" fill="#78350f" />
            <path d="M 24 46 L 24 54" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 36 46 L 36 54" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : idType === "power:battery-9v" ? (
          <svg viewBox="0 0 40 60" className="w-full h-full max-h-[70px]">
            <path d="M 14 10 L 14 2" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 26 10 L 26 2" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="4" y="10" width="32" height="46" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <rect x="8" y="18" width="24" height="30" rx="2" fill="#334155" />
            <text x="20" y="36" fontSize="9" fill="#f8fafc" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">9V</text>
          </svg>
        ) : isCapacitor ? (
          <svg viewBox="0 0 40 50" className="w-full h-full max-h-[70px]">
            <path d="M 8 40 L 8 30" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 32 40 L 32 30" stroke="#94a3b8" strokeWidth="2" />
            {idType === "passive:capacitor-electrolytic" ? (
              <>
                <rect x="2" y="4" width="36" height="28" rx="16" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.2" />
                <rect x="28" y="4" width="4" height="28" fill="#f8fafc" opacity="0.85" />
              </>
            ) : (
              <ellipse cx="20" cy="18" rx="17" ry="12" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
            )}
          </svg>
        ) : idType === "passive:diode" ? (
          <svg viewBox="0 0 60 24" className="w-full h-full max-h-[70px]">
            <path d="M 2 12 L 58 12" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="20,4 20,20 38,12" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <rect x="38" y="4" width="3" height="16" fill="#f8fafc" />
          </svg>
        ) : idType === "passive:transistor-npn" ? (
          <svg viewBox="0 0 44 46" className="w-full h-full max-h-[70px]">
            <path d="M 8 44 L 8 25 M 22 44 L 22 25 M 36 44 L 36 25" stroke="#94a3b8" strokeWidth="1.8" />
            <path d="M 4.4 25 A 17.6 17.6 0 1 1 39.6 25 Z" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <text x="22" y="19" fontSize="7" fill="#f8fafc" textAnchor="middle" fontFamily="monospace" fontWeight="bold">NPN</text>
          </svg>
        ) : (
          <svg viewBox="0 0 70 70" className="w-full h-full max-h-[70px]">
            <path d="M 28 62 L 28 55 M 42 62 L 42 55" stroke="#94a3b8" strokeWidth="1.8" />
            <circle cx="35" cy="32" r="33" fill="#334155" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="35" cy="32" r="25" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            <circle cx="35" cy="32" r="15" fill="#334155" />
            <circle cx="35" cy="32" r="3" fill="#0f172a" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center overflow-hidden ${className}`}
    />
  );
};
