import React, { useEffect, useRef, useState } from "react";
import { CircuitComponent, CircuitConnection, WireColor } from "../../types/circuit";
import { ARDUINO_UNO_PINS } from "./ArduinoUno";
import { getWokwiItem } from "../../services/wokwiCatalog";

export interface InProgressWireState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  color: string;
}

interface WireOverlayProps {
  components: CircuitComponent[];
  connections: CircuitConnection[];
  hoveredWireIndex?: number | null;
  onWireHover?: (index: number | null) => void;
  onDeleteWire?: (index: number) => void;
  inProgressWire?: InProgressWireState | null;
}

export function getComponentPinCoord(
  comp: CircuitComponent,
  pinName: string
): { x: number; y: number } | null {
  if (comp.type === "board:arduino-uno") {
    // Search in Uno pins
    const p = ARDUINO_UNO_PINS.find(
      (up) => up.id === pinName || up.id === `D${pinName}` || (pinName.startsWith("GND") && up.id.startsWith("GND"))
    );
    if (p) {
      return { x: comp.x + p.offsetX, y: comp.y + p.offsetY };
    }
    // Fallbacks for generic GND
    if (pinName === "GND") {
      return { x: comp.x + 114, y: comp.y + 132 };
    }
    return { x: comp.x + 100, y: comp.y + 50 };
  }

  if (comp.type === "output:led") {
    if (pinName === "anode" || pinName === "A") return { x: comp.x + 12, y: comp.y + 40 };
    if (pinName === "cathode" || pinName === "C") return { x: comp.x + 32, y: comp.y + 40 };
  }

  if (comp.type === "output:buzzer") {
    if (pinName === "positive" || pinName === "1") return { x: comp.x + 10, y: comp.y + 54 };
    if (pinName === "negative" || pinName === "2") return { x: comp.x + 34, y: comp.y + 54 };
  }

  if (comp.type === "output:servo") {
    if (pinName === "pwm" || pinName === "PWM") return { x: comp.x + 12, y: comp.y + 60 };
    if (pinName === "vcc" || pinName === "V+") return { x: comp.x + 25, y: comp.y + 60 };
    if (pinName === "gnd" || pinName === "GND") return { x: comp.x + 38, y: comp.y + 60 };
  }

  if (comp.type === "input:photoresistor") {
    if (pinName === "pin1" || pinName === "AO" || pinName === "1") return { x: comp.x + 12, y: comp.y + 50 };
    if (pinName === "pin2" || pinName === "GND" || pinName === "2") return { x: comp.x + 34, y: comp.y + 50 };
  }

  if (comp.type === "input:potentiometer") {
    if (pinName === "vcc" || pinName === "VCC") return { x: comp.x + 8, y: comp.y + 54 };
    if (pinName === "wiper" || pinName === "SIG") return { x: comp.x + 24, y: comp.y + 54 };
    if (pinName === "gnd" || pinName === "GND") return { x: comp.x + 40, y: comp.y + 54 };
  }

  if (comp.type === "passive:resistor") {
    if (pinName === "pin1" || pinName === "1") return { x: comp.x + 0, y: comp.y + 10 };
    if (pinName === "pin2" || pinName === "2") return { x: comp.x + 44, y: comp.y + 10 };
  }

  // Look up catalog item pins
  const item = getWokwiItem(comp.type, comp.properties);
  if (item && item.pins.length > 0) {
    const cleanPin = pinName.toLowerCase().replace(/^(pin|p|d)/, "");
    const pin = item.pins.find(
      (p) => {
        const idLow = p.id.toLowerCase();
        const labelLow = p.label.toLowerCase();
        const cleanId = idLow.replace(/^(pin|p|d)/, "");
        return (
          idLow === pinName.toLowerCase() ||
          labelLow === pinName.toLowerCase() ||
          cleanId === cleanPin ||
          idLow.includes(pinName.toLowerCase()) ||
          pinName.toLowerCase().includes(idLow)
        );
      }
    );
    if (pin) {
      return { x: comp.x + pin.offsetX, y: comp.y + pin.offsetY };
    }
    // Return first pin if available
    return { x: comp.x + item.pins[0].offsetX, y: comp.y + item.pins[0].offsetY };
  }

  return { x: comp.x + 20, y: comp.y + 20 };
}

const WIRE_HEX_MAP: Record<string, { stroke: string; glow: string }> = {
  red: { stroke: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
  black: { stroke: "#0f172a", glow: "rgba(15, 23, 42, 0.5)" },
  green: { stroke: "#22c55e", glow: "rgba(34, 197, 94, 0.4)" },
  blue: { stroke: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)" },
  yellow: { stroke: "#eab308", glow: "rgba(234, 179, 8, 0.4)" },
  white: { stroke: "#f8fafc", glow: "rgba(248, 250, 252, 0.5)" },
};

// --- Verlet-integration rope physics for wires -------------------------------------
// Each wire is a chain of points connected by distance constraints and pulled by
// gravity, with the two end points pinned to the live (possibly moving) pin
// coordinates. This is the same technique used for cloth/rope sims: no explicit
// velocity is stored - it's inferred each step from (current - previous) position,
// which makes the integration trivially stable.

const SEGMENTS = 12;
const GRAVITY = 640; // px/s^2 - how heavy the wire feels
const DAMPING = 0.98; // velocity retained per step (i.e. air resistance)
const SLACK_FACTOR = 1.16; // rope is kept ~16% longer than the taut distance, so it has room to sag
const CONSTRAINT_ITERATIONS = 8;
const MAX_DT = 1 / 30;

interface RopePoint {
  x: number;
  y: number;
  px: number;
  py: number;
}

function makeStraightRope(start: { x: number; y: number }, end: { x: number; y: number }): RopePoint[] {
  const pts: RopePoint[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
    pts.push({ x, y, px: x, py: y });
  }
  return pts;
}

function stepRope(rope: RopePoint[], start: { x: number; y: number }, end: { x: number; y: number }, dt: number) {
  // Pin the two ends to the live pin coordinates (which move as components are dragged).
  rope[0].x = start.x;
  rope[0].y = start.y;
  rope[0].px = start.x;
  rope[0].py = start.y;
  rope[SEGMENTS].x = end.x;
  rope[SEGMENTS].y = end.y;
  rope[SEGMENTS].px = end.x;
  rope[SEGMENTS].py = end.y;

  // Verlet integration for interior points.
  for (let i = 1; i < SEGMENTS; i++) {
    const p = rope[i];
    const vx = (p.x - p.px) * DAMPING;
    const vy = (p.y - p.py) * DAMPING;
    const nx = p.x + vx;
    const ny = p.y + vy + GRAVITY * dt * dt;
    p.px = p.x;
    p.py = p.y;
    p.x = nx;
    p.y = ny;
  }

  // Distance-constraint relaxation keeps segment lengths close to the rest length,
  // so the rope behaves like an (almost) inextensible cable rather than an elastic band.
  const straightDist = Math.hypot(end.x - start.x, end.y - start.y);
  const segLen = Math.max(1, (straightDist * SLACK_FACTOR) / SEGMENTS);
  for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
    for (let i = 0; i < SEGMENTS; i++) {
      const a = rope[i];
      const b = rope[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      const diff = (dist - segLen) / dist;
      const offsetX = dx * 0.5 * diff;
      const offsetY = dy * 0.5 * diff;
      if (i !== 0) {
        a.x += offsetX;
        a.y += offsetY;
      }
      if (i !== SEGMENTS - 1) {
        b.x -= offsetX;
        b.y -= offsetY;
      }
    }
  }
}

/** Smooth SVG path through a rope's points (quadratic-through-midpoints technique). */
function ropeToPath(rope: RopePoint[]): string {
  if (rope.length < 2) return "";
  let d = `M ${rope[0].x} ${rope[0].y} `;
  for (let i = 1; i < rope.length - 1; i++) {
    const mx = (rope[i].x + rope[i + 1].x) / 2;
    const my = (rope[i].y + rope[i + 1].y) / 2;
    d += `Q ${rope[i].x} ${rope[i].y}, ${mx} ${my} `;
  }
  const last = rope[rope.length - 1];
  d += `L ${last.x} ${last.y}`;
  return d;
}

export const WireOverlay: React.FC<WireOverlayProps> = ({
  components,
  connections,
  hoveredWireIndex,
  onWireHover,
  onDeleteWire,
  inProgressWire,
}) => {
  const componentsRef = useRef(components);
  const connectionsRef = useRef(connections);
  const inProgressRef = useRef(inProgressWire);
  componentsRef.current = components;
  connectionsRef.current = connections;
  inProgressRef.current = inProgressWire;

  const ropesRef = useRef(new Map<string, RopePoint[]>());
  const inProgressRopeRef = useRef<RopePoint[] | null>(null);
  const [, setTick] = useState(0);

  // Physics loop runs continuously (mount-once effect) and always reads the latest
  // component/connection data via refs, so dragging components doesn't tear the
  // animation frame down and restart it.
  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(MAX_DT, (now - lastTime) / 1000);
      lastTime = now;

      const comps = componentsRef.current;
      const compMap = new Map<string, CircuitComponent>();
      comps.forEach((c) => compMap.set(c.id, c));

      const liveKeys = new Set<string>();
      connectionsRef.current.forEach((conn) => {
        const fromComp = compMap.get(conn.from_id);
        const toComp = compMap.get(conn.to_id);
        if (!fromComp || !toComp) return;
        const start = getComponentPinCoord(fromComp, conn.from_pin);
        const end = getComponentPinCoord(toComp, conn.to_pin);
        if (!start || !end) return;

        const key = `${conn.from_id}:${conn.from_pin}->${conn.to_id}:${conn.to_pin}`;
        liveKeys.add(key);
        let rope = ropesRef.current.get(key);
        if (!rope) {
          rope = makeStraightRope(start, end);
          ropesRef.current.set(key, rope);
        }
        stepRope(rope, start, end, dt);
      });

      // Drop ropes belonging to wires that no longer exist.
      for (const key of ropesRef.current.keys()) {
        if (!liveKeys.has(key)) ropesRef.current.delete(key);
      }

      // In-progress (currently being dragged out) wire gets the same sag treatment.
      const inProg = inProgressRef.current;
      if (inProg) {
        const start = { x: inProg.startX, y: inProg.startY };
        const end = { x: inProg.currentX, y: inProg.currentY };
        if (!inProgressRopeRef.current) {
          inProgressRopeRef.current = makeStraightRope(start, end);
        }
        stepRope(inProgressRopeRef.current, start, end, dt);
      } else {
        inProgressRopeRef.current = null;
      }

      setTick((t) => (t + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const compMap = new Map<string, CircuitComponent>();
  components.forEach((c) => compMap.set(c.id, c));

  return (
    <g className="wires-layer">
      {/* Existing Placed Connections */}
      {connections.map((conn, idx) => {
        const fromComp = compMap.get(conn.from_id);
        const toComp = compMap.get(conn.to_id);

        if (!fromComp || !toComp) return null;

        const start = getComponentPinCoord(fromComp, conn.from_pin);
        const end = getComponentPinCoord(toComp, conn.to_pin);

        if (!start || !end) return null;

        const colorCfg = WIRE_HEX_MAP[conn.wire_color.toLowerCase()] || WIRE_HEX_MAP.yellow;
        const isHovered = hoveredWireIndex === idx;

        const key = `${conn.from_id}:${conn.from_pin}->${conn.to_id}:${conn.to_pin}`;
        const rope = ropesRef.current.get(key) ?? makeStraightRope(start, end);
        const pathData = ropeToPath(rope);
        const midPoint = rope[Math.floor(SEGMENTS / 2)] ?? { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

        return (
          <g
            key={`${conn.from_id}-${conn.from_pin}-${conn.to_id}-${conn.to_pin}-${idx}`}
            onMouseEnter={() => onWireHover?.(idx)}
            onMouseLeave={() => onWireHover?.(null)}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteWire?.(idx);
            }}
            className="cursor-pointer group"
          >
            {/* Wider invisible stroke for easy mouse hovering and clicking */}
            <path d={pathData} fill="none" stroke="transparent" strokeWidth="16" />

            {/* Wire Shadow */}
            <path
              d={pathData}
              fill="none"
              stroke="rgba(0, 0, 0, 0.35)"
              strokeWidth={isHovered ? "5" : "3.5"}
              transform="translate(2, 4)"
              strokeLinecap="round"
            />

            {/* Hover Glow */}
            {isHovered && (
              <path
                d={pathData}
                fill="none"
                stroke={colorCfg.glow}
                strokeWidth="8"
                strokeLinecap="round"
                className="transition-all"
              />
            )}

            {/* Main Colored Jumper Wire Body */}
            <path
              d={pathData}
              fill="none"
              stroke={colorCfg.stroke}
              strokeWidth={isHovered ? "4" : "2.8"}
              strokeLinecap="round"
            />

            {/* Pin Terminal End Dots */}
            <circle cx={start.x} cy={start.y} r="2" fill={colorCfg.stroke} stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={end.x} cy={end.y} r="2" fill={colorCfg.stroke} stroke="#0f172a" strokeWidth="0.8" />

            {/* Hover Tooltip Label with Click-to-Disconnect Hint */}
            {isHovered && (
              <g transform={`translate(${midPoint.x}, ${midPoint.y - 14})`} className="pointer-events-none">
                <rect x="-60" y="-12" width="120" height="20" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                <text x="0" y="-2" fontSize="6.5" fill="#f8fafc" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                  {conn.from_id}:{conn.from_pin} → {conn.to_id}:{conn.to_pin}
                </text>
                <text x="0" y="5.5" fontSize="5.5" fill="#ef4444" textAnchor="middle" fontFamily="sans-serif">
                  (Click to disconnect wire)
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* In-Progress Live Dragged Wire */}
      {inProgressWire && (
        <g className="pointer-events-none">
          {(() => {
            const start = { x: inProgressWire.startX, y: inProgressWire.startY };
            const end = { x: inProgressWire.currentX, y: inProgressWire.currentY };
            const colorCfg = WIRE_HEX_MAP[inProgressWire.color.toLowerCase()] || WIRE_HEX_MAP.yellow;

            const rope = inProgressRopeRef.current ?? makeStraightRope(start, end);
            const pathData = ropeToPath(rope);

            return (
              <>
                {/* Glow */}
                <path d={pathData} fill="none" stroke={colorCfg.glow} strokeWidth="8" strokeLinecap="round" />
                {/* Dashed In-Progress Wire */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={colorCfg.stroke}
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                {/* Source and Destination Pins */}
                <circle cx={start.x} cy={start.y} r="4" fill={colorCfg.stroke} stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={end.x} cy={end.y} r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" className="animate-ping" />
                <circle cx={end.x} cy={end.y} r="3" fill="#ffffff" />
              </>
            );
          })()}
        </g>
      )}
    </g>
  );
};
