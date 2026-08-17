# CircuitCraft Arduino Compiler

> **Active development has moved.** This app now lives in
> [kabeloblack/StudioHub](https://github.com/kabeloblack/StudioHub) (private) as one of
> three apps behind a shared launcher, at the `/circuitcraft` route. This repo is kept
> as history — changes pushed here will **not** reach the hub unless ported by hand.

A deterministic text-to-circuit compiler and interactive Arduino/RP2040 hardware simulator. Describe a circuit in natural language and get back a live, wired schematic you can simulate, inspect, and interact with.

## Features

- **Natural language to circuit**: turns plain-English prompts into wired circuit blueprints (components, connections, and Arduino sketch).
- **Cycle-accurate emulation**: real ATmega328P (Uno/Nano) emulation via [avr8js](https://github.com/wokwi/avr8js) and real RP2040 emulation via [rp2040js](https://github.com/wokwi/rp2040js), with a regex-based interpreter fallback for other boards (ESP32, Mega, Franzininho).
- **Interactive hardware canvas**: functional breadboard, protocol-accurate HD44780 character LCDs, WS2812/NeoPixel decoding, real webcam-backed camera modules, and physically simulated (verlet rope physics) wires, built on [@wokwi/elements](https://github.com/wokwi/wokwi-elements).
- **Live inspection**: CPU register viewer, compiled HEX/UF2 viewer, pinout table, and serial monitor.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`
