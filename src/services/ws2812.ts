import { ComponentType } from "../types/circuit";

/**
 * WS2812/NeoPixel single-wire protocol decoder, driven by precise cycle-timed pin edges
 * from a cycle-accurate CPU core (avr8js/rp2040js). Real NeoPixel timing per bit:
 *   "0" bit: ~0.4us HIGH, ~0.85us LOW   (total ~1.25us)
 *   "1" bit: ~0.8us HIGH, ~0.45us LOW   (total ~1.25us)
 *   Reset/latch: line held LOW for >=50us
 * Bytes are sent MSB-first in GRB order per pixel, chained back-to-back for however many
 * pixels are being addressed - this only works when driven by a true cycle-accurate core
 * (the interpreter fallback used for ESP32/Mega/Franzininho doesn't execute real
 * instruction timing, so it gets a separate high-level `strip.setPixelColor()` /
 * `strip.show()` call-matching path instead - see arduinoSimulator.ts).
 */
export interface RGB {
  r: number; // 0-255
  g: number;
  b: number;
}

export function getNeoPixelCount(type: ComponentType, properties?: Record<string, any>): number | null {
  if (type === "display:neopixel") return 1;
  if (type === "display:neopixel-matrix") {
    const rows = Number(properties?.rows) || 8;
    const cols = Number(properties?.cols) || 8;
    return rows * cols;
  }
  if (type === "display:neopixel-ring") {
    return Number(properties?.pixels) || 16;
  }
  return null;
}

export class Ws2812Decoder {
  private readonly pixelCount: number;
  private readonly cyclesPerUs: number;
  private frame: RGB[];
  private committed: RGB[];
  private bitBuffer: number[] = [];
  private currentPixelIndex = 0;
  private lastRisingCycle: number | null = null;
  private lastFallingCycle: number | null = null;

  constructor(pixelCount: number, clockHz: number) {
    this.pixelCount = pixelCount;
    this.cyclesPerUs = clockHz / 1_000_000;
    this.frame = Array.from({ length: pixelCount }, () => ({ r: 0, g: 0, b: 0 }));
    this.committed = Array.from({ length: pixelCount }, () => ({ r: 0, g: 0, b: 0 }));
  }

  /** Feed a raw pin edge (the new level, and the CPU cycle count at that instant).
   *  Returns true if a new frame was just latched (i.e. colors actually changed). */
  onPinTransition(isHigh: boolean, cycles: number): boolean {
    let latched = false;

    if (isHigh) {
      if (this.lastFallingCycle !== null) {
        const lowUs = (cycles - this.lastFallingCycle) / this.cyclesPerUs;
        if (lowUs > 50) {
          this.committed = this.frame.map((p) => ({ ...p }));
          this.currentPixelIndex = 0;
          this.bitBuffer = [];
          latched = true;
        }
      }
      this.lastRisingCycle = cycles;
    } else {
      if (this.lastRisingCycle !== null) {
        const highUs = (cycles - this.lastRisingCycle) / this.cyclesPerUs;
        this.lastFallingCycle = cycles;

        // Reject anything wildly outside the valid 0/1 bit range instead of misreading it.
        if (highUs >= 0.15 && highUs <= 1.3 && this.currentPixelIndex < this.pixelCount) {
          const bit = highUs > 0.6 ? 1 : 0;
          this.bitBuffer.push(bit);
          if (this.bitBuffer.length === 24) {
            let g = 0;
            let r = 0;
            let b = 0;
            for (let i = 0; i < 8; i++) g = (g << 1) | this.bitBuffer[i];
            for (let i = 8; i < 16; i++) r = (r << 1) | this.bitBuffer[i];
            for (let i = 16; i < 24; i++) b = (b << 1) | this.bitBuffer[i];
            this.frame[this.currentPixelIndex] = { r, g, b };
            this.currentPixelIndex++;
            this.bitBuffer = [];
          }
        } else {
          this.bitBuffer = [];
        }
      }
    }

    return latched;
  }

  /** Real WS2812 chips latch on an internal timeout once the line's been idle long
   *  enough, not on "the next edge happens to arrive" - if a sketch calls `show()` once
   *  and then does nothing else, there IS no next edge to hang a latch off of. The
   *  engine calls this periodically (once per simulation batch) with the current cycle
   *  count so a completed-but-unlatched frame still gets committed. */
  checkIdleTimeout(currentCycles: number): boolean {
    if (this.currentPixelIndex === 0) return false;
    const lastEdge = this.lastFallingCycle ?? this.lastRisingCycle;
    if (lastEdge === null) return false;
    const idleUs = (currentCycles - lastEdge) / this.cyclesPerUs;
    if (idleUs > 50) {
      this.committed = this.frame.map((p) => ({ ...p }));
      this.currentPixelIndex = 0;
      this.bitBuffer = [];
      return true;
    }
    return false;
  }

  getPixels(): RGB[] {
    return this.committed;
  }
}
