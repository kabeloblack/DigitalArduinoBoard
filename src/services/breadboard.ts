import { PinDefinition } from "../types/circuit";

/**
 * Half-size solderless breadboard geometry and electrical model.
 *
 * Real breadboard electrical layout:
 * - Main area: each column has two independent 5-hole groups (a-e above the center
 *   gap, f-j below it). All 5 holes within a group are electrically continuous; the
 *   center gap breaks continuity between the top and bottom groups of the same column.
 * - Power rails: a +/- pair along the top and another along the bottom, each row
 *   continuous along its full length. (Real breadboards also break rails at the
 *   midpoint; this model simplifies rails to a single continuous strip per row.)
 */
export const BB_COLS = 20;
const PITCH = 10;
const MARGIN_X = 14;
export const RAIL_TOP_PLUS_Y = 14;
export const RAIL_TOP_MINUS_Y = 24;
const MAIN_TOP_START_Y = RAIL_TOP_MINUS_Y + 16; // 40
const MAIN_BOT_START_Y = MAIN_TOP_START_Y + 4 * PITCH + PITCH + 16; // 106
export const RAIL_BOT_PLUS_Y = MAIN_BOT_START_Y + 4 * PITCH + PITCH + 16; // 172
export const RAIL_BOT_MINUS_Y = RAIL_BOT_PLUS_Y + 10; // 182
export const CENTER_GAP_Y = (MAIN_TOP_START_Y + 4 * PITCH + MAIN_BOT_START_Y) / 2;

export const BB_WIDTH = MARGIN_X * 2 + (BB_COLS - 1) * PITCH + PITCH; // 230
export const BB_HEIGHT = RAIL_BOT_MINUS_Y + 14; // 196

const TOP_ROWS = ["a", "b", "c", "d", "e"];
const BOT_ROWS = ["f", "g", "h", "i", "j"];

function colX(col: number): number {
  return MARGIN_X + (col - 1) * PITCH;
}

/** Builds the full set of breadboard holes as PinDefinitions. */
export function generateBreadboardPins(): PinDefinition[] {
  const pins: PinDefinition[] = [];

  for (let col = 1; col <= BB_COLS; col++) {
    const x = colX(col);
    TOP_ROWS.forEach((row, i) => {
      pins.push({
        id: `m${col}${row}`,
        label: `${col}${row}`,
        offsetX: x,
        offsetY: MAIN_TOP_START_Y + i * PITCH,
        type: "passive",
      });
    });
    BOT_ROWS.forEach((row, i) => {
      pins.push({
        id: `m${col}${row}`,
        label: `${col}${row}`,
        offsetX: x,
        offsetY: MAIN_BOT_START_Y + i * PITCH,
        type: "passive",
      });
    });
    pins.push({ id: `rtp${col}`, label: `T+${col}`, offsetX: x, offsetY: RAIL_TOP_PLUS_Y, type: "power" });
    pins.push({ id: `rtm${col}`, label: `T-${col}`, offsetX: x, offsetY: RAIL_TOP_MINUS_Y, type: "ground" });
    pins.push({ id: `rbp${col}`, label: `B+${col}`, offsetX: x, offsetY: RAIL_BOT_PLUS_Y, type: "power" });
    pins.push({ id: `rbm${col}`, label: `B-${col}`, offsetX: x, offsetY: RAIL_BOT_MINUS_Y, type: "ground" });
  }

  return pins;
}

/**
 * Maps a breadboard hole's pin id to its electrical group key. Two holes on the same
 * breadboard with the same key are electrically connected with no wire needed between
 * them. Returns null for an unrecognized id (defensive - all generated pins match).
 */
export function getBreadboardNetKey(pinId: string): string | null {
  const mainMatch = pinId.match(/^m(\d+)([a-j])$/);
  if (mainMatch) {
    const [, col, row] = mainMatch;
    const group = TOP_ROWS.includes(row) ? "top" : "bot";
    return `m${col}-${group}`;
  }
  if (/^rtp\d+$/.test(pinId)) return "rail-top-plus";
  if (/^rtm\d+$/.test(pinId)) return "rail-top-minus";
  if (/^rbp\d+$/.test(pinId)) return "rail-bot-plus";
  if (/^rbm\d+$/.test(pinId)) return "rail-bot-minus";
  return null;
}
