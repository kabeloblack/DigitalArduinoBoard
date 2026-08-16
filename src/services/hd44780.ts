import { ComponentType } from "../types/circuit";

/**
 * HD44780 character-LCD controller decoder, driven by the standard Arduino 4-bit
 * interface (RS, E, D4-D7 - matches `LiquidCrystal lcd(rs, e, d4, d5, d6, d7)`, the
 * overwhelming majority of real Arduino LCD wiring; RW is assumed tied to GND/unused,
 * as is standard). Each 8-bit command/data byte is sent as two 4-bit nibbles (high
 * nibble first), latched on E's HIGH-to-LOW edge - this mirrors the real hardware
 * protocol closely enough to correctly render `lcd.print()` output, without needing to
 * model timing-sensitive quirks the display's *readback* behavior would need (this
 * decoder is write-only, matching how these displays are used in practice).
 */

export type Hd44780PinRole = "rs" | "e" | "d4" | "d5" | "d6" | "d7";

export const LCD_PIN_ROLES: Record<string, Hd44780PinRole> = {
  RS: "rs",
  E: "e",
  D4: "d4",
  D5: "d5",
  D6: "d6",
  D7: "d7",
};

export function getLcdDimensions(type: ComponentType): { cols: number; rows: number } | null {
  if (type === "display:lcd1602") return { cols: 16, rows: 2 };
  if (type === "display:lcd2004") return { cols: 20, rows: 4 };
  return null;
}

export class Hd44780Decoder {
  private pins: Record<Hd44780PinRole, boolean> = {
    rs: false,
    e: false,
    d4: false,
    d5: false,
    d6: false,
    d7: false,
  };
  private nibbleHigh: number | null = null;
  private fourBitModeEstablished = false;
  private cursorAddr = 0;
  private buffer: string[];
  private readonly rowStarts: number[];
  private readonly cols: number;
  private displayOn = true;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rowStarts = rows === 4 ? [0x00, 0x40, 0x14, 0x54] : [0x00, 0x40];
    this.buffer = Array.from({ length: rows }, () => " ".repeat(cols));
  }

  /** Feeds a pin-role transition in. Returns true if the rendered content changed. */
  setPin(role: Hd44780PinRole, value: boolean): boolean {
    const prevE = this.pins.e;
    this.pins[role] = value;
    if (role === "e" && prevE && !value) {
      return this.latchNibble();
    }
    return false;
  }

  private latchNibble(): boolean {
    const nibble = (this.pins.d7 ? 8 : 0) | (this.pins.d6 ? 4 : 0) | (this.pins.d5 ? 2 : 0) | (this.pins.d4 ? 1 : 0);

    if (this.nibbleHigh === null) {
      // The standard init sequence (LiquidCrystal::begin) sends the "Function Set" high
      // nibble alone - 0x3 while the controller is still assumed to be in 8-bit mode,
      // then a final 0x2 that commands it to switch into real 4-bit (paired-nibble)
      // mode. Only while that switch hasn't happened yet do lone nibbles get absorbed as
      // complete instructions instead of starting a pair - otherwise a later *paired*
      // Function Set command (0x28, whose high nibble is also 0x2) would be misread the
      // same way and desync every byte after it.
      if (!this.fourBitModeEstablished && !this.pins.rs && (nibble === 0x2 || nibble === 0x3)) {
        if (nibble === 0x2) this.fourBitModeEstablished = true;
        return false;
      }
      this.nibbleHigh = nibble;
      return false;
    }

    const byte = (this.nibbleHigh << 4) | nibble;
    this.nibbleHigh = null;
    return this.pins.rs ? this.writeChar(byte) : this.execCommand(byte);
  }

  private execCommand(byte: number): boolean {
    if (byte === 0x01) {
      // Clear display
      this.buffer = this.buffer.map(() => " ".repeat(this.cols));
      this.cursorAddr = 0;
      return true;
    }
    if (byte === 0x02 || byte === 0x03) {
      // Return home
      this.cursorAddr = 0;
      return false;
    }
    if (byte & 0x80) {
      // Set DDRAM address (cursor position)
      this.cursorAddr = byte & 0x7f;
      return false;
    }
    if ((byte & 0xf8) === 0x08) {
      // Display on/off control
      const wasOn = this.displayOn;
      this.displayOn = (byte & 0x04) !== 0;
      return wasOn !== this.displayOn;
    }
    return false; // Function set / entry mode set - not needed for text rendering
  }

  private writeChar(byte: number): boolean {
    const ch = byte >= 32 && byte < 127 ? String.fromCharCode(byte) : " ";
    let row = 0;
    for (let r = this.rowStarts.length - 1; r >= 0; r--) {
      if (this.cursorAddr >= this.rowStarts[r]) {
        row = r;
        break;
      }
    }
    const col = this.cursorAddr - this.rowStarts[row];
    if (col >= 0 && col < this.cols) {
      const rowStr = this.buffer[row];
      this.buffer[row] = rowStr.slice(0, col) + ch + rowStr.slice(col + 1);
    }
    this.cursorAddr++;
    return true;
  }

  getLines(): string[] {
    return this.displayOn ? this.buffer : this.buffer.map(() => " ".repeat(this.cols));
  }

  // --- High-level direct API -------------------------------------------------------
  // For engines that don't simulate real bit-level pin protocols and instead recognize
  // library calls directly (e.g. the lightweight interpreter matching `lcd.print(...)`
  // as a pattern, the same way it already special-cases `myServo.write(...)`).

  writeString(str: string): void {
    for (const ch of str) {
      this.writeChar(ch.charCodeAt(0));
    }
  }

  setCursorRC(col: number, row: number): void {
    const r = Math.max(0, Math.min(this.rowStarts.length - 1, row));
    this.cursorAddr = this.rowStarts[r] + Math.max(0, col);
  }

  clear(): void {
    this.buffer = this.buffer.map(() => " ".repeat(this.cols));
    this.cursorAddr = 0;
  }
}
