import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { WOKWI_CATALOG } from "./src/services/wokwiCatalog";

dotenv.config();

// Built from the full Wokwi hardware catalog so every component already wired into
// the canvas (all 50 @wokwi/elements parts) is also selectable by the AI compiler.
const PARTS_INVENTORY = WOKWI_CATALOG.map((item, idx) => {
  const propsHint = Object.keys(item.defaultProps).length
    ? ` Property keys: ${Object.keys(item.defaultProps).join(", ")}.`
    : "";
  const pinList = item.pins.length ? item.pins.map((p) => `"${p.id}"`).join(", ") : "none";
  return `${idx + 1}. "${item.idType}" (${item.category}) - ${item.title}: ${item.description} Pins: ${pinList}.${propsHint}`;
}).join("\n");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI lazy client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

const CIRCUIT_SYSTEM_INSTRUCTION = `You are a deterministic Text-to-Circuit compiler for an online interactive Arduino simulator. Your sole job is to translate a user's natural language project description into a complete, working hardware layout and functional code blueprint.

You must output a single, raw, valid JSON object following the schema provided.

### AVAILABLE PARTS INVENTORY
You can only use components from this exact list (idType, pins, and optional property keys):
${PARTS_INVENTORY}

Prefer the simplest board ("board:arduino-uno") unless the prompt specifically calls for Wi-Fi/Bluetooth (use "board:esp32-devkit-v1" or "board:nano-rp2040-connect"), a compact form factor ("board:arduino-nano"), an ATtiny target ("board:franzininho"), or many I/O pins ("board:arduino-mega"). Choose sensors, displays, and outputs from the full inventory above whenever they better match the prompt than a generic LED/buzzer.

### HARDWARE PLACEMENT RULES
1. The canvas origin is (0,0). Place the board at x: 100, y: 150 as the anchor.
2. Arrange components neatly to the right of the board (x > 260) spaced out by at least 80 pixels so they do not overlap.
3. Every LED ("output:led") MUST have a 220-ohm resistor connected in series with one of its pins to prevent burning out.

### WIRING AND ROUTING RULES
1. Wires connect specific component pins. Pin names must match the inventory list exactly.
2. For the Arduino Uno, valid pin identifiers are: "GND.1", "GND.2", "GND.3", "5V", "3.3V", "A0", "A1", "A2", "A3", "A4", "A5", and digital pins "D0" through "D13".
3. Wire colors must follow conventions: Power = "red", Ground = "black", Signal = matching component colors or "yellow"/"blue".

### EXECUTABLE CRITICAL ASSURANCE
- Ensure all digital and analog pins used in the 'arduino_code' match the exact pin assignments declared in the 'connections' array.
- Code must compile with standard Arduino libraries (Servo.h is allowed).
- Write clean, complete C++ Arduino code with setup() and loop() and meaningful comments.`;

app.post("/api/compile-circuit", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required and must be a string." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a structured error indicating offline/demo mode is available
      return res.status(503).json({
        error: "GEMINI_API_KEY not configured. Falling back to deterministic local compiler.",
        fallback: true,
      });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: CIRCUIT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            project_title: { type: Type.STRING, description: "Short descriptive title of the system" },
            conceptual_summary: { type: Type.STRING, description: "A 2-sentence explanation of how the system fulfills the user prompt." },
            components: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  properties: {
                    type: Type.OBJECT,
                    properties: {
                      color: { type: Type.STRING, description: "LED/pushbutton color, e.g. red, green, blue, yellow, white, orange" },
                      value: { type: Type.STRING, description: "Resistor value, e.g. 220, 1000, 10k, 100k" },
                      digits: { type: Type.STRING, description: "7-segment digit count" },
                      text: { type: Type.STRING, description: "LCD display text" },
                      rows: { type: Type.INTEGER, description: "NeoPixel matrix rows" },
                      cols: { type: Type.INTEGER, description: "NeoPixel matrix columns" },
                      pixels: { type: Type.INTEGER, description: "NeoPixel ring pixel count" },
                      temperature: { type: Type.NUMBER, description: "DHT22 seed temperature (C)" },
                      humidity: { type: Type.NUMBER, description: "DHT22 seed humidity (%)" },
                      distance: { type: Type.NUMBER, description: "HC-SR04 seed distance (cm)" },
                      lightLevel: { type: Type.INTEGER, description: "Photoresistor seed analog reading (0-1023)" },
                      potValue: { type: Type.INTEGER, description: "Potentiometer seed analog reading (0-1023)" },
                    },
                  },
                },
                required: ["id", "type", "x", "y", "properties"],
              },
            },
            connections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  from_id: { type: Type.STRING },
                  from_pin: { type: Type.STRING },
                  to_id: { type: Type.STRING },
                  to_pin: { type: Type.STRING },
                  wire_color: { type: Type.STRING },
                },
                required: ["from_id", "from_pin", "to_id", "to_pin", "wire_color"],
              },
            },
            arduino_code: { type: Type.STRING, description: "The complete, syntax-valid C++ code." },
          },
          required: ["project_title", "conceptual_summary", "components", "connections", "arduino_code"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "Empty response from compiler model." });
    }

    const circuitData = JSON.parse(text);
    return res.json(circuitData);
  } catch (error: any) {
    console.error("Error compiling circuit:", error);
    return res.status(500).json({
      error: error.message || "Failed to compile circuit.",
      fallback: true,
    });
  }
});

// Compile Arduino C++ Sketch to Intel HEX using AVR-GCC compiler backend
app.post("/api/compile-sketch", async (req, res) => {
  try {
    const { sketch, board = "uno" } = req.body;
    if (!sketch || typeof sketch !== "string") {
      return res.status(400).json({ error: "Sketch code is required." });
    }

    const response = await fetch("https://hexi.wokwi.com/build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sketch, board }),
    });

    const data = await response.json();
    if (!response.ok || data.stderr?.includes("error:")) {
      return res.status(200).json({
        success: false,
        error: data.stderr || "Compilation failed",
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        hex: data.hex || null,
      });
    }

    return res.json({
      success: true,
      hex: data.hex,
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      eep: data.eep || "",
    });
  } catch (err: any) {
    console.error("Error connecting to AVR compiler service:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Compiler service unreachable",
      fallback: true,
    });
  }
});

// Vite middleware in dev or static files in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CircuitCraft server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
