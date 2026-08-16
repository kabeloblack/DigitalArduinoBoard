export type ComponentType =
  // Boards & MCUs
  | "board:arduino-uno"
  | "board:arduino-nano"
  | "board:arduino-mega"
  | "board:esp32-devkit-v1"
  | "board:nano-rp2040-connect"
  | "board:franzininho"
  // Displays & Visuals
  | "display:7segment"
  | "display:lcd1602"
  | "display:lcd2004"
  | "display:ssd1306"
  | "display:ili9341"
  | "display:led-bar-graph"
  | "display:neopixel-matrix"
  | "display:neopixel-ring"
  | "display:neopixel"
  // Outputs & Actuators
  | "output:led"
  | "output:rgb-led"
  | "output:buzzer"
  | "output:servo"
  | "output:dc-motor"
  | "output:stepper-motor"
  | "output:biaxial-stepper"
  | "output:relay"
  | "output:speaker"
  // Sensors & Inputs
  | "input:potentiometer"
  | "input:slide-potentiometer"
  | "input:photoresistor"
  | "input:dht22"
  | "input:hc-sr04"
  | "input:pir-motion"
  | "input:mpu6050"
  | "input:gas-sensor"
  | "input:flame-sensor"
  | "input:analog-joystick"
  | "input:ky-040"
  | "input:ntc-temperature"
  | "input:heart-beat"
  | "input:sound-sensor"
  | "input:small-sound-sensor"
  | "input:hx711"
  | "input:tilt-switch"
  | "input:ds1307"
  | "input:ir-receiver"
  | "input:ir-remote"
  // Switches & Keypads
  | "input:pushbutton"
  | "input:pushbutton-6mm"
  | "input:slide-switch"
  | "input:dip-switch-8"
  | "input:membrane-keypad"
  | "input:rotary-dialer"
  // Passives & Storage
  | "passive:resistor"
  | "passive:capacitor-ceramic"
  | "passive:capacitor-electrolytic"
  | "passive:diode"
  | "passive:transistor-npn"
  | "storage:microsd-card"
  // Tools
  | "tool:breadboard"
  // Power
  | "power:battery-9v"
  // Cameras
  | "input:camera-arducam"
  | "input:camera-ov7670";

export type LedColor = "red" | "green" | "blue" | "yellow" | "orange" | "white";
export type WireColor = "red" | "black" | "green" | "blue" | "yellow" | "white";

export interface ComponentProperties {
  color?: LedColor | string;
  value?: string; // "220", "10k", etc.
  [key: string]: any;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  properties: ComponentProperties;
}

export interface CircuitConnection {
  from_id: string;
  from_pin: string;
  to_id: string;
  to_pin: string;
  wire_color: WireColor | string;
}

export interface CircuitBlueprint {
  project_title: string;
  conceptual_summary: string;
  components: CircuitComponent[];
  connections: CircuitConnection[];
  arduino_code: string;
}

export interface PinDefinition {
  id: string;
  label: string;
  offsetX: number;
  offsetY: number;
  type: "power" | "ground" | "digital" | "analog" | "signal" | "passive";
  voltage?: number;
}

export interface LiveComponentState {
  // LED
  isOn?: boolean;
  brightness?: number; // 0-255
  // Buzzer
  isBuzzing?: boolean;
  frequency?: number;
  // Servo
  servoAngle?: number; // 0-180
  // DC Motor
  motorSpeed?: number; // 0-255 (PWM-driven)
  // Pushbutton
  isPressed?: boolean;
  // Transistor (NPN, used as a digital switch)
  isConducting?: boolean;
  // Character LCD (HD44780) - flattened row-major text buffer
  lcdText?: string;
  // NeoPixel/WS2812 - one {r,g,b} (0-255) per pixel, row-major for matrices
  neoPixels?: Array<{ r: number; g: number; b: number }>;
  // Photoresistor
  lightLevel?: number; // 0-1023 (analog reading)
  // Potentiometer
  potValue?: number; // 0-1023 (analog reading)
  // Resistor
  resistance?: number;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  timeMs: number;
  speed: number; // 0.5, 1, 2, etc.
  soundMuted: boolean;
  serialLogs: Array<{ id: string; text: string; time: number }>;
  digitalPins: Record<string, number>; // 0 or 1
  analogPins: Record<string, number>; // 0 to 1023
  pwmPins: Record<string, number>; // 0 to 255
  componentStates: Record<string, LiveComponentState>;
  executionError: string | null;
}
