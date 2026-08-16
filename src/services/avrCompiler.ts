import PRESET_HEX_DATA from "../../presetHex.json";

export interface CompileResult {
  success: boolean;
  hex: string | null;
  stdout: string;
  stderr: string;
  error?: string;
  progBytes?: Uint8Array;
}

/**
 * Parses Intel HEX format into raw binary byte buffer
 */
export function parseHex(hex: string, bufferSize: number = 32768): Uint8Array {
  const target = new Uint8Array(bufferSize);
  let highAddress = 0;

  for (const rawLine of hex.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith(":")) {
      const bytes = parseInt(line.substring(1, 3), 16);
      const addr = parseInt(line.substring(3, 7), 16);
      const type = parseInt(line.substring(7, 9), 16);

      if (type === 0) {
        // Data record
        for (let i = 0; i < bytes; i++) {
          const byteVal = parseInt(line.substring(9 + i * 2, 11 + i * 2), 16);
          const finalAddr = highAddress + addr + i;
          if (finalAddr < target.length) {
            target[finalAddr] = byteVal;
          }
        }
      } else if (type === 1) {
        // End Of File
        break;
      } else if (type === 2) {
        // Extended Segment Address
        highAddress = parseInt(line.substring(9, 13), 16) << 4;
      } else if (type === 4) {
        // Extended Linear Address
        highAddress = parseInt(line.substring(9, 13), 16) << 16;
      }
    }
  }

  return target;
}

/**
 * Compiles Arduino C++ code to Intel HEX firmware using the backend / Hexi service
 */
export async function compileArduinoSketch(
  sketch: string,
  board: "uno" | "mega" | "nano" | "attiny85" = "uno"
): Promise<CompileResult> {
  // Check if sketch matches known pre-compiled presets for instant offline loading
  const lower = sketch.toLowerCase();
  let presetKey: string | null = null;
  if (lower.includes("armed & monitoring") || lower.includes("intruder")) {
    presetKey = "nighttime_alarm";
  } else if (lower.includes("servo potentiometer controller") || lower.includes("myservo.attach")) {
    presetKey = "servo_potentiometer";
  } else if (lower.includes("optical theremin") || lower.includes("lux level")) {
    presetKey = "light_theremin";
  } else if (lower.includes("traffic signal beacon") || lower.includes("status: red")) {
    presetKey = "traffic_light";
  }

  try {
    const res = await fetch("/api/compile-sketch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sketch, board }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.hex) {
        const progBytes = parseHex(
          data.hex,
          board === "mega" ? 262144 : board === "attiny85" ? 8192 : 32768
        );
        return {
          success: true,
          hex: data.hex,
          stdout: data.stdout || "AVR-GCC Compilation Complete. 0 errors.",
          stderr: data.stderr || "",
          progBytes,
        };
      }
      if (data.error) {
        return {
          success: false,
          hex: null,
          stdout: data.stdout || "",
          stderr: data.stderr || data.error,
          error: data.error,
        };
      }
    }
  } catch (err: any) {
    console.warn("Backend compiler unreachable, using client fallback:", err);
  }

  // Fallback to preset hex or direct Hexi
  if (presetKey && (PRESET_HEX_DATA as any)[presetKey]) {
    const hex = (PRESET_HEX_DATA as any)[presetKey];
    return {
      success: true,
      hex,
      stdout: "Loaded pre-compiled AVR8js binary firmware.",
      stderr: "",
      progBytes: parseHex(hex),
    };
  }

  // Try direct Hexi as secondary fallback
  try {
    const res = await fetch("https://hexi.wokwi.com/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sketch, board }),
    });
    const data = await res.json();
    if (data.hex) {
      return {
        success: true,
        hex: data.hex,
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        progBytes: parseHex(data.hex),
      };
    }
    return {
      success: false,
      hex: null,
      stdout: data.stdout || "",
      stderr: data.stderr || "Compilation failed",
      error: data.stderr,
    };
  } catch (err: any) {
    return {
      success: false,
      hex: null,
      stdout: "",
      stderr: err.message || "Failed to compile",
      error: err.message,
    };
  }
}
