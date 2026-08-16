import { CircuitComponent, CircuitConnection } from "../types/circuit";
import { getWokwiItem } from "./wokwiCatalog";
import { getBreadboardNetKey } from "./breadboard";

/**
 * Resolves electrically-connected pins across the whole circuit graph: explicit wires
 * (connections) plus a breadboard's internal column/rail continuity (see breadboard.ts).
 * This lets a signal reach a component through a breadboard with no direct wire between
 * them - e.g. Board -> wire -> breadboard hole -> (same column, no wire) -> another hole
 * -> wire -> LED - the same way multi-hop explicit wire chains resolve too.
 *
 * Built once per simulator instance (or whenever the blueprint changes) and reused for
 * every pin-transition lookup, since the underlying circuit topology doesn't change
 * between rebuilds.
 */
export interface NetResolver {
  /** All "compId:pin" keys electrically connected to the given pin, including itself. */
  getConnectedPins(compId: string, pin: string): Set<string>;
}

interface SwitchTopology {
  /** Pin groups always shorted together on this component, regardless of state (e.g. a
   *  pushbutton's two legs on the same side are one electrical terminal). */
  staticGroups?: string[][];
  /** The two terminal pins that get shorted together only while the switch is closed
   *  (pressed). */
  dynamicBridge?: [string, string];
}

/** Component types whose contacts can be dynamically opened/closed during simulation. */
export const SWITCH_TOPOLOGY: Partial<Record<string, SwitchTopology>> = {
  "input:pushbutton": {
    staticGroups: [
      ["1.l", "1.r"],
      ["2.l", "2.r"],
    ],
    dynamicBridge: ["1.l", "2.l"],
  },
  "input:pushbutton-6mm": {
    staticGroups: [
      ["1.l", "1.r"],
      ["2.l", "2.r"],
    ],
    dynamicBridge: ["1.l", "2.l"],
  },
  // NPN transistor modeled as a base-driven switch: a HIGH base current lets
  // collector-emitter conduct. Unlike buttons (user-driven), this bridge is toggled by
  // the simulator engines from the base pin's own electrical state - see
  // `applyDriveToNet` in each engine.
  "passive:transistor-npn": {
    dynamicBridge: ["C", "E"],
  },
};

const BOARD_DIGITAL_PIN = /^(?:D|GP)?(\d+)$/i;

/** Normalizes board pin references so "D13", "GP13" and "13" all resolve to the same net. */
function canonicalPin(compId: string, pin: string, boardIds: Set<string>): string {
  if (boardIds.has(compId)) {
    const m = pin.match(BOARD_DIGITAL_PIN);
    if (m) return m[1];
  }
  return pin;
}

export function buildNetResolver(
  components: CircuitComponent[],
  connections: CircuitConnection[],
  closedSwitches: Set<string> = new Set()
): NetResolver {
  const boardIds = new Set(components.filter((c) => c.type.startsWith("board:")).map((c) => c.id));

  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let root = x;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let cur = x;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  // Explicit wires
  for (const conn of connections) {
    const fromPin = canonicalPin(conn.from_id, conn.from_pin, boardIds);
    const toPin = canonicalPin(conn.to_id, conn.to_pin, boardIds);
    union(`${conn.from_id}:${fromPin}`, `${conn.to_id}:${toPin}`);
  }

  // Switch/button contacts: static leg pairs are always shorted; the dynamic bridge is
  // only shorted while the switch is in `closedSwitches` (e.g. currently held down).
  for (const comp of components) {
    const topo = SWITCH_TOPOLOGY[comp.type];
    if (!topo) continue;
    topo.staticGroups?.forEach((group) => {
      for (let i = 1; i < group.length; i++) {
        union(`${comp.id}:${group[0]}`, `${comp.id}:${group[i]}`);
      }
    });
    if (topo.dynamicBridge && closedSwitches.has(comp.id)) {
      union(`${comp.id}:${topo.dynamicBridge[0]}`, `${comp.id}:${topo.dynamicBridge[1]}`);
    }
  }

  // Breadboard internal connectivity: every hole in the same column group / rail row
  // joins a synthetic per-net anchor, so any two of them end up in the same group even
  // with no explicit wire between them.
  for (const comp of components) {
    if (comp.type !== "tool:breadboard") continue;
    const item = getWokwiItem(comp.type, comp.properties);
    if (!item) continue;
    for (const pin of item.pins) {
      const netKey = getBreadboardNetKey(pin.id);
      if (!netKey) continue;
      union(`${comp.id}:${pin.id}`, `__bbnet__:${comp.id}:${netKey}`);
    }
  }

  // Precompute root -> group membership once (excluding synthetic anchors) so lookups
  // afterward are O(1) instead of re-scanning every key on every pin transition.
  const groups = new Map<string, Set<string>>();
  for (const key of parent.keys()) {
    if (key.startsWith("__bbnet__:")) continue;
    const root = find(key);
    if (!groups.has(root)) groups.set(root, new Set());
    groups.get(root)!.add(key);
  }

  return {
    getConnectedPins(compId: string, pin: string): Set<string> {
      const normalizedPin = canonicalPin(compId, pin, boardIds);
      const key = `${compId}:${normalizedPin}`;
      if (!parent.has(key)) return new Set([key]);
      const root = find(key);
      return groups.get(root) ?? new Set([key]);
    },
  };
}
