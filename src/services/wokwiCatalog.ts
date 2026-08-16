import { ComponentType, PinDefinition } from "../types/circuit";
import { BB_WIDTH, BB_HEIGHT, generateBreadboardPins } from "./breadboard";

export interface WokwiItemDefinition {
  idType: ComponentType;
  wokwiTag: string;
  title: string;
  category: "Boards" | "Displays" | "Outputs" | "Sensors" | "Switches" | "Passives" | "Tools" | "Cameras" | "Power";
  categoryColor: string;
  description: string;
  badge: string;
  defaultProps: Record<string, any>;
  width: number;
  height: number;
  pins: PinDefinition[];
}

export const WOKWI_CATALOG: WokwiItemDefinition[] = [
  {
    idType: "tool:breadboard",
    wokwiTag: "custom-breadboard",
    title: "Half-Size Breadboard",
    category: "Tools",
    categoryColor: "#f59e0b",
    description: "Solderless prototyping breadboard. 20 columns of 5-hole groups (electrically joined) plus top/bottom power rails - plug parts into the same column or rail to connect them without a wire.",
    badge: "20 Columns",
    defaultProps: {},
    width: BB_WIDTH,
    height: BB_HEIGHT,
    pins: generateBreadboardPins(),
  },
  {
    idType: "power:battery-9v",
    wokwiTag: "custom-battery-9v",
    title: "9V Battery",
    category: "Power",
    categoryColor: "#22c55e",
    description: "Standard 9V PP3 battery with snap connector. A standalone power source for battery-powered projects, separate from USB/barrel-jack power.",
    badge: "9V PP3",
    defaultProps: {},
    width: 54,
    height: 74,
    pins: [
      { id: "+", label: "+", offsetX: 16, offsetY: 0, type: "power" },
      { id: "-", label: "-", offsetX: 38, offsetY: 0, type: "ground" },
    ],
  },
  {
    idType: "input:camera-arducam",
    wokwiTag: "custom-camera-arducam",
    title: "ArduCam Mini 2MP Plus (OV2640)",
    category: "Cameras",
    categoryColor: "#f472b6",
    description: "SPI+I2C camera module (OV2640 sensor). Connect a real webcam to preview a live feed directly on the canvas.",
    badge: "SPI + I2C",
    defaultProps: {},
    width: 90,
    height: 80,
    pins: [
      { id: "CS", label: "CS", offsetX: 10, offsetY: 76, type: "digital" },
      { id: "MOSI", label: "MOSI", offsetX: 22, offsetY: 76, type: "digital" },
      { id: "MISO", label: "MISO", offsetX: 34, offsetY: 76, type: "digital" },
      { id: "SCK", label: "SCK", offsetX: 46, offsetY: 76, type: "digital" },
      { id: "GND", label: "GND", offsetX: 58, offsetY: 76, type: "ground" },
      { id: "VCC", label: "VCC", offsetX: 70, offsetY: 76, type: "power" },
      { id: "SDA", label: "SDA", offsetX: 10, offsetY: 4, type: "digital" },
      { id: "SCL", label: "SCL", offsetX: 22, offsetY: 4, type: "digital" },
    ],
  },
  {
    idType: "input:camera-ov7670",
    wokwiTag: "custom-camera-ov7670",
    title: "OV7670 Camera Module",
    category: "Cameras",
    categoryColor: "#f472b6",
    description: "Parallel-bus VGA camera module (OV7670 sensor). Connect a real webcam to preview a live feed directly on the canvas.",
    badge: "Parallel Bus",
    defaultProps: {},
    width: 120,
    height: 112,
    pins: [
      { id: "3.3V", label: "3.3V", offsetX: 4, offsetY: 6, type: "power" },
      { id: "GND", label: "GND", offsetX: 4, offsetY: 18, type: "ground" },
      { id: "SIOC", label: "SIOC", offsetX: 4, offsetY: 30, type: "digital" },
      { id: "SIOD", label: "SIOD", offsetX: 4, offsetY: 42, type: "digital" },
      { id: "VSYNC", label: "VSYNC", offsetX: 4, offsetY: 54, type: "digital" },
      { id: "HREF", label: "HREF", offsetX: 4, offsetY: 66, type: "digital" },
      { id: "PCLK", label: "PCLK", offsetX: 4, offsetY: 78, type: "digital" },
      { id: "XCLK", label: "XCLK", offsetX: 4, offsetY: 90, type: "digital" },
      { id: "D7", label: "D7", offsetX: 116, offsetY: 2, type: "digital" },
      { id: "D6", label: "D6", offsetX: 116, offsetY: 13, type: "digital" },
      { id: "D5", label: "D5", offsetX: 116, offsetY: 24, type: "digital" },
      { id: "D4", label: "D4", offsetX: 116, offsetY: 35, type: "digital" },
      { id: "D3", label: "D3", offsetX: 116, offsetY: 46, type: "digital" },
      { id: "D2", label: "D2", offsetX: 116, offsetY: 57, type: "digital" },
      { id: "D1", label: "D1", offsetX: 116, offsetY: 68, type: "digital" },
      { id: "D0", label: "D0", offsetX: 116, offsetY: 79, type: "digital" },
      { id: "RESET", label: "RESET", offsetX: 116, offsetY: 90, type: "digital" },
      { id: "PWDN", label: "PWDN", offsetX: 116, offsetY: 101, type: "digital" },
    ],
  },
  {
    idType: "board:arduino-uno",
    wokwiTag: "wokwi-arduino-uno",
    title: "Arduino Uno R3",
    category: "Boards",
    categoryColor: "#008184",
    description: "ATmega328P MCU with 14 digital I/O (6 PWM) & 6 analog input pins (16MHz, 5V).",
    badge: "ATmega328P",
    defaultProps: {},
    width: 270,
    height: 200,
    pins: [
          {
                "id": "A5.2",
                "label": "A5.2",
                "offsetX": 87,
                "offsetY": 9,
                "type": "analog"
          },
          {
                "id": "A4.2",
                "label": "A4.2",
                "offsetX": 97,
                "offsetY": 9,
                "type": "analog"
          },
          {
                "id": "AREF",
                "label": "AREF",
                "offsetX": 106,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "GND.1",
                "label": "GND.1",
                "offsetX": 115.5,
                "offsetY": 9,
                "type": "ground"
          },
          {
                "id": "13",
                "label": "13",
                "offsetX": 125,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "12",
                "label": "12",
                "offsetX": 134.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "11",
                "label": "11",
                "offsetX": 144,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "10",
                "label": "10",
                "offsetX": 153.5,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "9",
                "label": "9",
                "offsetX": 163,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "8",
                "label": "8",
                "offsetX": 173,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "7",
                "label": "7",
                "offsetX": 189,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "6",
                "label": "6",
                "offsetX": 198.5,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "5",
                "label": "5",
                "offsetX": 208,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "4",
                "label": "4",
                "offsetX": 217.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "3",
                "label": "3",
                "offsetX": 227,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 236.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "1",
                "label": "1",
                "offsetX": 246,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "0",
                "label": "0",
                "offsetX": 255.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "IOREF",
                "label": "IOREF",
                "offsetX": 131,
                "offsetY": 191.5,
                "type": "digital"
          },
          {
                "id": "RESET",
                "label": "RESET",
                "offsetX": 140.5,
                "offsetY": 191.5,
                "type": "digital"
          },
          {
                "id": "3.3V",
                "label": "3.3V",
                "offsetX": 150,
                "offsetY": 191.5,
                "type": "power"
          },
          {
                "id": "5V",
                "label": "5V",
                "offsetX": 160,
                "offsetY": 191.5,
                "type": "power"
          },
          {
                "id": "GND.2",
                "label": "GND.2",
                "offsetX": 169.5,
                "offsetY": 191.5,
                "type": "ground"
          },
          {
                "id": "GND.3",
                "label": "GND.3",
                "offsetX": 179,
                "offsetY": 191.5,
                "type": "ground"
          },
          {
                "id": "VIN",
                "label": "VIN",
                "offsetX": 188.5,
                "offsetY": 191.5,
                "type": "power"
          },
          {
                "id": "A0",
                "label": "A0",
                "offsetX": 208,
                "offsetY": 191.5,
                "type": "analog"
          },
          {
                "id": "A1",
                "label": "A1",
                "offsetX": 217.5,
                "offsetY": 191.5,
                "type": "analog"
          },
          {
                "id": "A2",
                "label": "A2",
                "offsetX": 227,
                "offsetY": 191.5,
                "type": "analog"
          },
          {
                "id": "A3",
                "label": "A3",
                "offsetX": 236.5,
                "offsetY": 191.5,
                "type": "analog"
          },
          {
                "id": "A4",
                "label": "A4",
                "offsetX": 246,
                "offsetY": 191.5,
                "type": "analog"
          },
          {
                "id": "A5",
                "label": "A5",
                "offsetX": 255.5,
                "offsetY": 191.5,
                "type": "analog"
          }
    ],
  },
  {
    idType: "board:arduino-nano",
    wokwiTag: "wokwi-arduino-nano",
    title: "Arduino Nano",
    category: "Boards",
    categoryColor: "#0284c7",
    description: "Compact ATmega328P breadboard-friendly microcontroller with mini USB.",
    badge: "Compact 5V",
    defaultProps: {},
    width: 140,
    height: 200,
    pins: [
          {
                "id": "12",
                "label": "12",
                "offsetX": 19.7,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "11",
                "label": "11",
                "offsetX": 29.3,
                "offsetY": 4.8,
                "type": "signal"
          },
          {
                "id": "10",
                "label": "10",
                "offsetX": 38.9,
                "offsetY": 4.8,
                "type": "signal"
          },
          {
                "id": "9",
                "label": "9",
                "offsetX": 48.5,
                "offsetY": 4.8,
                "type": "signal"
          },
          {
                "id": "8",
                "label": "8",
                "offsetX": 58.1,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "7",
                "label": "7",
                "offsetX": 67.7,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "6",
                "label": "6",
                "offsetX": 77.3,
                "offsetY": 4.8,
                "type": "signal"
          },
          {
                "id": "5",
                "label": "5",
                "offsetX": 86.9,
                "offsetY": 4.8,
                "type": "signal"
          },
          {
                "id": "4",
                "label": "4",
                "offsetX": 96.5,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "3",
                "label": "3",
                "offsetX": 106.1,
                "offsetY": 4.8,
                "type": "signal"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 115.7,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "GND.2",
                "label": "GND.2",
                "offsetX": 125.3,
                "offsetY": 4.8,
                "type": "ground"
          },
          {
                "id": "RESET.2",
                "label": "RESET.2",
                "offsetX": 134.9,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "0",
                "label": "0",
                "offsetX": 144.5,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "1",
                "label": "1",
                "offsetX": 154.1,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "13",
                "label": "13",
                "offsetX": 19.7,
                "offsetY": 62.4,
                "type": "digital"
          },
          {
                "id": "3.3V",
                "label": "3.3V",
                "offsetX": 29.3,
                "offsetY": 62.4,
                "type": "power"
          },
          {
                "id": "AREF",
                "label": "AREF",
                "offsetX": 38.9,
                "offsetY": 62.4,
                "type": "digital"
          },
          {
                "id": "A0",
                "label": "A0",
                "offsetX": 48.5,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "A1",
                "label": "A1",
                "offsetX": 58.1,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "A2",
                "label": "A2",
                "offsetX": 67.7,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "A3",
                "label": "A3",
                "offsetX": 77.3,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "A4",
                "label": "A4",
                "offsetX": 86.9,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "A5",
                "label": "A5",
                "offsetX": 96.5,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "A6",
                "label": "A6",
                "offsetX": 106.1,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "A7",
                "label": "A7",
                "offsetX": 115.7,
                "offsetY": 62.4,
                "type": "analog"
          },
          {
                "id": "5V",
                "label": "5V",
                "offsetX": 125.3,
                "offsetY": 62.4,
                "type": "power"
          },
          {
                "id": "RESET",
                "label": "RESET",
                "offsetX": 134.9,
                "offsetY": 62.4,
                "type": "digital"
          },
          {
                "id": "GND.1",
                "label": "GND.1",
                "offsetX": 144.5,
                "offsetY": 62.4,
                "type": "ground"
          },
          {
                "id": "VIN",
                "label": "VIN",
                "offsetX": 154.1,
                "offsetY": 62.4,
                "type": "power"
          },
          {
                "id": "12.2",
                "label": "12.2",
                "offsetX": 163.7,
                "offsetY": 43.2,
                "type": "digital"
          },
          {
                "id": "5V.2",
                "label": "5V.2",
                "offsetX": 154.1,
                "offsetY": 43.2,
                "type": "power"
          },
          {
                "id": "13.2",
                "label": "13.2",
                "offsetX": 163.7,
                "offsetY": 33.6,
                "type": "digital"
          },
          {
                "id": "11.2",
                "label": "11.2",
                "offsetX": 154.1,
                "offsetY": 33.6,
                "type": "signal"
          },
          {
                "id": "RESET.3",
                "label": "RESET.3",
                "offsetX": 163.7,
                "offsetY": 24,
                "type": "digital"
          },
          {
                "id": "GND.3",
                "label": "GND.3",
                "offsetX": 154.1,
                "offsetY": 24,
                "type": "ground"
          }
    ],
  },
  {
    idType: "board:arduino-mega",
    wokwiTag: "wokwi-arduino-mega",
    title: "Arduino Mega 2560",
    category: "Boards",
    categoryColor: "#0f766e",
    description: "ATmega2560 board with 54 digital I/O pins, 16 analog inputs, and 4 UARTs.",
    badge: "54 GPIOs",
    defaultProps: {},
    width: 320,
    height: 220,
    pins: [
          {
                "id": "SCL",
                "label": "SCL",
                "offsetX": 90,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "SDA",
                "label": "SDA",
                "offsetX": 100,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "AREF",
                "label": "AREF",
                "offsetX": 109,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "GND.1",
                "label": "GND.1",
                "offsetX": 119,
                "offsetY": 9,
                "type": "ground"
          },
          {
                "id": "13",
                "label": "13",
                "offsetX": 129,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "12",
                "label": "12",
                "offsetX": 138,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "11",
                "label": "11",
                "offsetX": 148,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "10",
                "label": "10",
                "offsetX": 157.5,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "9",
                "label": "9",
                "offsetX": 167.5,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "8",
                "label": "8",
                "offsetX": 177,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "7",
                "label": "7",
                "offsetX": 190,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "6",
                "label": "6",
                "offsetX": 200,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "5",
                "label": "5",
                "offsetX": 209.5,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "4",
                "label": "4",
                "offsetX": 219,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "3",
                "label": "3",
                "offsetX": 228.5,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 238,
                "offsetY": 9,
                "type": "signal"
          },
          {
                "id": "1",
                "label": "1",
                "offsetX": 247.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "0",
                "label": "0",
                "offsetX": 257.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "14",
                "label": "14",
                "offsetX": 270.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "15",
                "label": "15",
                "offsetX": 280,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "16",
                "label": "16",
                "offsetX": 289.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "17",
                "label": "17",
                "offsetX": 299,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "18",
                "label": "18",
                "offsetX": 308.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "19",
                "label": "19",
                "offsetX": 318.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "20",
                "label": "20",
                "offsetX": 328,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "21",
                "label": "21",
                "offsetX": 337.5,
                "offsetY": 9,
                "type": "digital"
          },
          {
                "id": "5V.1",
                "label": "5V.1",
                "offsetX": 361,
                "offsetY": 8,
                "type": "power"
          },
          {
                "id": "5V.2",
                "label": "5V.2",
                "offsetX": 371,
                "offsetY": 8,
                "type": "power"
          },
          {
                "id": "22",
                "label": "22",
                "offsetX": 361,
                "offsetY": 17.5,
                "type": "digital"
          },
          {
                "id": "23",
                "label": "23",
                "offsetX": 371,
                "offsetY": 17.5,
                "type": "digital"
          },
          {
                "id": "24",
                "label": "24",
                "offsetX": 361,
                "offsetY": 27.3,
                "type": "digital"
          },
          {
                "id": "25",
                "label": "25",
                "offsetX": 371,
                "offsetY": 27.3,
                "type": "digital"
          },
          {
                "id": "26",
                "label": "26",
                "offsetX": 361,
                "offsetY": 36.8,
                "type": "digital"
          },
          {
                "id": "27",
                "label": "27",
                "offsetX": 371,
                "offsetY": 36.8,
                "type": "digital"
          },
          {
                "id": "28",
                "label": "28",
                "offsetX": 361,
                "offsetY": 46.3,
                "type": "digital"
          },
          {
                "id": "29",
                "label": "29",
                "offsetX": 371,
                "offsetY": 46.3,
                "type": "digital"
          },
          {
                "id": "30",
                "label": "30",
                "offsetX": 361,
                "offsetY": 56,
                "type": "digital"
          },
          {
                "id": "31",
                "label": "31",
                "offsetX": 371,
                "offsetY": 56,
                "type": "digital"
          },
          {
                "id": "32",
                "label": "32",
                "offsetX": 361,
                "offsetY": 65.5,
                "type": "digital"
          },
          {
                "id": "33",
                "label": "33",
                "offsetX": 371,
                "offsetY": 65.5,
                "type": "digital"
          },
          {
                "id": "34",
                "label": "34",
                "offsetX": 361,
                "offsetY": 75,
                "type": "digital"
          },
          {
                "id": "35",
                "label": "35",
                "offsetX": 371,
                "offsetY": 75,
                "type": "digital"
          },
          {
                "id": "36",
                "label": "36",
                "offsetX": 361,
                "offsetY": 84.5,
                "type": "digital"
          },
          {
                "id": "37",
                "label": "37",
                "offsetX": 371,
                "offsetY": 84.5,
                "type": "digital"
          },
          {
                "id": "38",
                "label": "38",
                "offsetX": 361,
                "offsetY": 94.3,
                "type": "digital"
          },
          {
                "id": "39",
                "label": "39",
                "offsetX": 371,
                "offsetY": 94.3,
                "type": "digital"
          },
          {
                "id": "40",
                "label": "40",
                "offsetX": 361,
                "offsetY": 103.8,
                "type": "digital"
          },
          {
                "id": "41",
                "label": "41",
                "offsetX": 371,
                "offsetY": 103.8,
                "type": "digital"
          },
          {
                "id": "42",
                "label": "42",
                "offsetX": 361,
                "offsetY": 113.5,
                "type": "digital"
          },
          {
                "id": "43",
                "label": "43",
                "offsetX": 371,
                "offsetY": 113.5,
                "type": "digital"
          },
          {
                "id": "44",
                "label": "44",
                "offsetX": 361,
                "offsetY": 123,
                "type": "signal"
          },
          {
                "id": "45",
                "label": "45",
                "offsetX": 371,
                "offsetY": 123,
                "type": "signal"
          },
          {
                "id": "46",
                "label": "46",
                "offsetX": 361,
                "offsetY": 132.8,
                "type": "signal"
          },
          {
                "id": "47",
                "label": "47",
                "offsetX": 371,
                "offsetY": 132.8,
                "type": "digital"
          },
          {
                "id": "48",
                "label": "48",
                "offsetX": 361,
                "offsetY": 142.3,
                "type": "digital"
          },
          {
                "id": "49",
                "label": "49",
                "offsetX": 371,
                "offsetY": 142.3,
                "type": "digital"
          },
          {
                "id": "50",
                "label": "50",
                "offsetX": 361,
                "offsetY": 152,
                "type": "digital"
          },
          {
                "id": "51",
                "label": "51",
                "offsetX": 371,
                "offsetY": 152,
                "type": "digital"
          },
          {
                "id": "52",
                "label": "52",
                "offsetX": 361,
                "offsetY": 161.5,
                "type": "digital"
          },
          {
                "id": "53",
                "label": "53",
                "offsetX": 371,
                "offsetY": 161.5,
                "type": "digital"
          },
          {
                "id": "GND.4",
                "label": "GND.4",
                "offsetX": 361,
                "offsetY": 171.3,
                "type": "ground"
          },
          {
                "id": "GND.5",
                "label": "GND.5",
                "offsetX": 371,
                "offsetY": 171.3,
                "type": "ground"
          },
          {
                "id": "IOREF",
                "label": "IOREF",
                "offsetX": 136,
                "offsetY": 184.5,
                "type": "digital"
          },
          {
                "id": "RESET",
                "label": "RESET",
                "offsetX": 145.5,
                "offsetY": 184.5,
                "type": "digital"
          },
          {
                "id": "3.3V",
                "label": "3.3V",
                "offsetX": 155,
                "offsetY": 184.5,
                "type": "power"
          },
          {
                "id": "5V",
                "label": "5V",
                "offsetX": 164.5,
                "offsetY": 184.5,
                "type": "power"
          },
          {
                "id": "GND.2",
                "label": "GND.2",
                "offsetX": 174.3,
                "offsetY": 184.5,
                "type": "ground"
          },
          {
                "id": "GND.3",
                "label": "GND.3",
                "offsetX": 183.8,
                "offsetY": 184.5,
                "type": "ground"
          },
          {
                "id": "VIN",
                "label": "VIN",
                "offsetX": 193.5,
                "offsetY": 184.5,
                "type": "power"
          },
          {
                "id": "A0",
                "label": "A0",
                "offsetX": 208.5,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A1",
                "label": "A1",
                "offsetX": 218,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A2",
                "label": "A2",
                "offsetX": 227.5,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A3",
                "label": "A3",
                "offsetX": 237.3,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A4",
                "label": "A4",
                "offsetX": 246.8,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A5",
                "label": "A5",
                "offsetX": 256.3,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A6",
                "label": "A6",
                "offsetX": 266,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A7",
                "label": "A7",
                "offsetX": 275.5,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A8",
                "label": "A8",
                "offsetX": 290.3,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A9",
                "label": "A9",
                "offsetX": 300,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A10",
                "label": "A10",
                "offsetX": 309.5,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A11",
                "label": "A11",
                "offsetX": 319.3,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A12",
                "label": "A12",
                "offsetX": 328.8,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A13",
                "label": "A13",
                "offsetX": 338.5,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A14",
                "label": "A14",
                "offsetX": 348,
                "offsetY": 184.5,
                "type": "analog"
          },
          {
                "id": "A15",
                "label": "A15",
                "offsetX": 357.8,
                "offsetY": 184.5,
                "type": "analog"
          }
    ],
  },
  {
    idType: "board:esp32-devkit-v1",
    wokwiTag: "wokwi-esp32-devkit-v1",
    title: "ESP32 DevKit V1",
    category: "Boards",
    categoryColor: "#be185d",
    description: "Dual-core Xtensa 32-bit MCU with built-in Wi-Fi 802.11 b/g/n and Bluetooth BLE.",
    badge: "Wi-Fi & BLE",
    defaultProps: {},
    width: 170,
    height: 220,
    pins: [
          {
                "id": "VIN",
                "label": "VIN",
                "offsetX": 5,
                "offsetY": 158.5,
                "type": "power"
          },
          {
                "id": "GND.2",
                "label": "GND.2",
                "offsetX": 5,
                "offsetY": 149,
                "type": "ground"
          },
          {
                "id": "D13",
                "label": "D13",
                "offsetX": 5,
                "offsetY": 139.5,
                "type": "signal"
          },
          {
                "id": "D12",
                "label": "D12",
                "offsetX": 5,
                "offsetY": 130.4,
                "type": "signal"
          },
          {
                "id": "D14",
                "label": "D14",
                "offsetX": 5,
                "offsetY": 120,
                "type": "signal"
          },
          {
                "id": "D27",
                "label": "D27",
                "offsetX": 5,
                "offsetY": 110.8,
                "type": "signal"
          },
          {
                "id": "D26",
                "label": "D26",
                "offsetX": 5,
                "offsetY": 101,
                "type": "signal"
          },
          {
                "id": "D25",
                "label": "D25",
                "offsetX": 5,
                "offsetY": 91.3,
                "type": "signal"
          },
          {
                "id": "D33",
                "label": "D33",
                "offsetX": 5,
                "offsetY": 81.7,
                "type": "signal"
          },
          {
                "id": "D32",
                "label": "D32",
                "offsetX": 5,
                "offsetY": 72.2,
                "type": "signal"
          },
          {
                "id": "D35",
                "label": "D35",
                "offsetX": 5,
                "offsetY": 62.9,
                "type": "digital"
          },
          {
                "id": "D34",
                "label": "D34",
                "offsetX": 5,
                "offsetY": 53.1,
                "type": "digital"
          },
          {
                "id": "VN",
                "label": "VN",
                "offsetX": 5,
                "offsetY": 44,
                "type": "digital"
          },
          {
                "id": "VP",
                "label": "VP",
                "offsetX": 5,
                "offsetY": 34,
                "type": "digital"
          },
          {
                "id": "EN",
                "label": "EN",
                "offsetX": 5,
                "offsetY": 24,
                "type": "digital"
          },
          {
                "id": "3V3",
                "label": "3V3",
                "offsetX": 101.3,
                "offsetY": 158.5,
                "type": "power"
          },
          {
                "id": "GND.1",
                "label": "GND.1",
                "offsetX": 101.3,
                "offsetY": 149,
                "type": "ground"
          },
          {
                "id": "D15",
                "label": "D15",
                "offsetX": 101.3,
                "offsetY": 139.5,
                "type": "signal"
          },
          {
                "id": "D2",
                "label": "D2",
                "offsetX": 101.3,
                "offsetY": 130.4,
                "type": "signal"
          },
          {
                "id": "D4",
                "label": "D4",
                "offsetX": 101.3,
                "offsetY": 120,
                "type": "signal"
          },
          {
                "id": "RX2",
                "label": "RX2",
                "offsetX": 101.3,
                "offsetY": 110.8,
                "type": "signal"
          },
          {
                "id": "TX2",
                "label": "TX2",
                "offsetX": 101.3,
                "offsetY": 101,
                "type": "signal"
          },
          {
                "id": "D5",
                "label": "D5",
                "offsetX": 101.3,
                "offsetY": 91.3,
                "type": "signal"
          },
          {
                "id": "D18",
                "label": "D18",
                "offsetX": 101.3,
                "offsetY": 81.7,
                "type": "signal"
          },
          {
                "id": "D19",
                "label": "D19",
                "offsetX": 101.3,
                "offsetY": 72.2,
                "type": "signal"
          },
          {
                "id": "D21",
                "label": "D21",
                "offsetX": 101.3,
                "offsetY": 62.9,
                "type": "signal"
          },
          {
                "id": "RX0",
                "label": "RX0",
                "offsetX": 101.3,
                "offsetY": 53.1,
                "type": "signal"
          },
          {
                "id": "TX0",
                "label": "TX0",
                "offsetX": 101.3,
                "offsetY": 44,
                "type": "signal"
          },
          {
                "id": "D22",
                "label": "D22",
                "offsetX": 101.3,
                "offsetY": 34,
                "type": "signal"
          },
          {
                "id": "D23",
                "label": "D23",
                "offsetX": 101.3,
                "offsetY": 24,
                "type": "signal"
          }
    ],
  },
  {
    idType: "board:nano-rp2040-connect",
    wokwiTag: "wokwi-nano-rp2040-connect",
    title: "Nano RP2040 Connect",
    category: "Boards",
    categoryColor: "#7c3aed",
    description: "Raspberry Pi dual-core ARM Cortex-M0+ with u-blox NINA Wi-Fi/Bluetooth & 6-axis IMU.",
    badge: "RP2040 + WiFi",
    defaultProps: {},
    width: 150,
    height: 200,
    pins: [
          {
                "id": "D12",
                "label": "D12",
                "offsetX": 20.1,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D11",
                "label": "D11",
                "offsetX": 29.8,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D10",
                "label": "D10",
                "offsetX": 39.3,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D9",
                "label": "D9",
                "offsetX": 48.9,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D8",
                "label": "D8",
                "offsetX": 58.5,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D7",
                "label": "D7",
                "offsetX": 68.1,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D6",
                "label": "D6",
                "offsetX": 77.7,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D5",
                "label": "D5",
                "offsetX": 87.3,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D4",
                "label": "D4",
                "offsetX": 96.9,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D3",
                "label": "D3",
                "offsetX": 106.5,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "D2",
                "label": "D2",
                "offsetX": 116.1,
                "offsetY": 1,
                "type": "signal"
          },
          {
                "id": "GND.1",
                "label": "GND.1",
                "offsetX": 125.2,
                "offsetY": 1,
                "type": "ground"
          },
          {
                "id": "RESET",
                "label": "RESET",
                "offsetX": 135.3,
                "offsetY": 1,
                "type": "digital"
          },
          {
                "id": "RX",
                "label": "RX",
                "offsetX": 153.9,
                "offsetY": 1,
                "type": "digital"
          },
          {
                "id": "TX",
                "label": "TX",
                "offsetX": 144.5,
                "offsetY": 1,
                "type": "digital"
          },
          {
                "id": "D13",
                "label": "D13",
                "offsetX": 20.1,
                "offsetY": 67.5,
                "type": "digital"
          },
          {
                "id": "3.3V",
                "label": "3.3V",
                "offsetX": 29.7,
                "offsetY": 67.5,
                "type": "power"
          },
          {
                "id": "AREF",
                "label": "AREF",
                "offsetX": 39.3,
                "offsetY": 67.5,
                "type": "digital"
          },
          {
                "id": "A0",
                "label": "A0",
                "offsetX": 48.8,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "A1",
                "label": "A1",
                "offsetX": 58.5,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "A2",
                "label": "A2",
                "offsetX": 68,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "A3",
                "label": "A3",
                "offsetX": 77.6,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "A4",
                "label": "A4",
                "offsetX": 87.3,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "A5",
                "label": "A5",
                "offsetX": 96.9,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "A6",
                "label": "A6",
                "offsetX": 106.5,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "A7",
                "label": "A7",
                "offsetX": 116.1,
                "offsetY": 67.5,
                "type": "analog"
          },
          {
                "id": "5V",
                "label": "5V",
                "offsetX": 125.5,
                "offsetY": 67.5,
                "type": "power"
          },
          {
                "id": "RESET.2",
                "label": "RESET.2",
                "offsetX": 134.9,
                "offsetY": 67.5,
                "type": "digital"
          },
          {
                "id": "GND.2",
                "label": "GND.2",
                "offsetX": 145.3,
                "offsetY": 67.5,
                "type": "ground"
          },
          {
                "id": "VIN",
                "label": "VIN",
                "offsetX": 154.1,
                "offsetY": 67.5,
                "type": "power"
          }
    ],
  },
  {
    idType: "board:franzininho",
    wokwiTag: "wokwi-franzininho",
    title: "Franzininho (ATtiny85)",
    category: "Boards",
    categoryColor: "#ea580c",
    description: "Minimalist open hardware DIY development board powered by ATtiny85 microcontroller.",
    badge: "ATtiny85",
    defaultProps: {},
    width: 130,
    height: 150,
    pins: [
          {
                "id": "GND.1",
                "label": "GND.1",
                "offsetX": 218.5,
                "offsetY": 23.3,
                "type": "ground"
          },
          {
                "id": "VCC.1",
                "label": "VCC.1",
                "offsetX": 218.5,
                "offsetY": 32.9,
                "type": "power"
          },
          {
                "id": "PB4",
                "label": "PB4",
                "offsetX": 218.5,
                "offsetY": 42.5,
                "type": "analog"
          },
          {
                "id": "PB5",
                "label": "PB5",
                "offsetX": 218.5,
                "offsetY": 52.2,
                "type": "analog"
          },
          {
                "id": "PB3",
                "label": "PB3",
                "offsetX": 218.5,
                "offsetY": 61.7,
                "type": "analog"
          },
          {
                "id": "PB2",
                "label": "PB2",
                "offsetX": 218.5,
                "offsetY": 71.2,
                "type": "analog"
          },
          {
                "id": "PB1",
                "label": "PB1",
                "offsetX": 218.5,
                "offsetY": 80.9,
                "type": "signal"
          },
          {
                "id": "PB0",
                "label": "PB0",
                "offsetX": 218.5,
                "offsetY": 90.5,
                "type": "signal"
          },
          {
                "id": "VIN",
                "label": "VIN",
                "offsetX": 132.7,
                "offsetY": 8.1,
                "type": "power"
          },
          {
                "id": "GND.2",
                "label": "GND.2",
                "offsetX": 142.9,
                "offsetY": 8.1,
                "type": "ground"
          },
          {
                "id": "VCC.2",
                "label": "VCC.2",
                "offsetX": 153,
                "offsetY": 8.1,
                "type": "power"
          }
    ],
  },
  {
    idType: "display:7segment",
    wokwiTag: "wokwi-7segment",
    title: "7-Segment Display",
    category: "Displays",
    categoryColor: "#ef4444",
    description: "Single digit 7-segment LED numeral indicator with decimal point (A-G, DP).",
    badge: "1-Digit LED",
    defaultProps: {"digits":"1"},
    width: 90,
    height: 120,
    pins: [
          {
                "id": "COM.1",
                "label": "COM.1",
                "offsetX": 23.7,
                "offsetY": 71.8,
                "type": "digital"
          },
          {
                "id": "COM.2",
                "label": "COM.2",
                "offsetX": 23.7,
                "offsetY": 3.8,
                "type": "digital"
          },
          {
                "id": "A",
                "label": "A",
                "offsetX": 33.3,
                "offsetY": 3.8,
                "type": "digital"
          },
          {
                "id": "B",
                "label": "B",
                "offsetX": 42.9,
                "offsetY": 3.8,
                "type": "digital"
          },
          {
                "id": "C",
                "label": "C",
                "offsetX": 33.3,
                "offsetY": 71.8,
                "type": "digital"
          },
          {
                "id": "D",
                "label": "D",
                "offsetX": 14.1,
                "offsetY": 71.8,
                "type": "digital"
          },
          {
                "id": "E",
                "label": "E",
                "offsetX": 4.5,
                "offsetY": 71.8,
                "type": "digital"
          },
          {
                "id": "F",
                "label": "F",
                "offsetX": 14.1,
                "offsetY": 3.8,
                "type": "digital"
          },
          {
                "id": "G",
                "label": "G",
                "offsetX": 4.5,
                "offsetY": 3.8,
                "type": "digital"
          },
          {
                "id": "DP",
                "label": "DP",
                "offsetX": 42.9,
                "offsetY": 71.8,
                "type": "digital"
          }
    ],
  },
  {
    idType: "display:lcd1602",
    wokwiTag: "wokwi-lcd1602",
    title: "LCD 1602 Display",
    category: "Displays",
    categoryColor: "#0284c7",
    description: "HD44780-compatible 16x2 alphanumeric liquid crystal character display with backlight.",
    badge: "16x2 Chars",
    defaultProps: {"text":"Hello Arduino!"},
    width: 220,
    height: 100,
    pins: [
          {
                "id": "VSS",
                "label": "VSS",
                "offsetX": 32,
                "offsetY": 131,
                "type": "ground"
          },
          {
                "id": "VDD",
                "label": "VDD",
                "offsetX": 41.5,
                "offsetY": 131,
                "type": "power"
          },
          {
                "id": "V0",
                "label": "V0",
                "offsetX": 51.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "RS",
                "label": "RS",
                "offsetX": 60.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "RW",
                "label": "RW",
                "offsetX": 70.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "E",
                "label": "E",
                "offsetX": 80,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D0",
                "label": "D0",
                "offsetX": 89.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D1",
                "label": "D1",
                "offsetX": 99.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D2",
                "label": "D2",
                "offsetX": 109,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D3",
                "label": "D3",
                "offsetX": 118.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D4",
                "label": "D4",
                "offsetX": 128,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D5",
                "label": "D5",
                "offsetX": 137.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D6",
                "label": "D6",
                "offsetX": 147,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "D7",
                "label": "D7",
                "offsetX": 156.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "A",
                "label": "A",
                "offsetX": 166.5,
                "offsetY": 131,
                "type": "digital"
          },
          {
                "id": "K",
                "label": "K",
                "offsetX": 176,
                "offsetY": 131,
                "type": "digital"
          }
    ],
  },
  {
    idType: "display:lcd2004",
    wokwiTag: "wokwi-lcd2004",
    title: "LCD 2004 Display",
    category: "Displays",
    categoryColor: "#0369a1",
    description: "Spacious 20x4 alphanumeric dot matrix character display for dashboards & telemetry.",
    badge: "20x4 Chars",
    defaultProps: {},
    width: 240,
    height: 120,
    pins: [
          {
                "id": "VSS",
                "label": "VSS",
                "offsetX": 32,
                "offsetY": 174.4,
                "type": "ground"
          },
          {
                "id": "VDD",
                "label": "VDD",
                "offsetX": 41.5,
                "offsetY": 174.4,
                "type": "power"
          },
          {
                "id": "V0",
                "label": "V0",
                "offsetX": 51.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "RS",
                "label": "RS",
                "offsetX": 60.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "RW",
                "label": "RW",
                "offsetX": 70.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "E",
                "label": "E",
                "offsetX": 80,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D0",
                "label": "D0",
                "offsetX": 89.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D1",
                "label": "D1",
                "offsetX": 99.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D2",
                "label": "D2",
                "offsetX": 109,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D3",
                "label": "D3",
                "offsetX": 118.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D4",
                "label": "D4",
                "offsetX": 128,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D5",
                "label": "D5",
                "offsetX": 137.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D6",
                "label": "D6",
                "offsetX": 147,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "D7",
                "label": "D7",
                "offsetX": 156.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "A",
                "label": "A",
                "offsetX": 166.5,
                "offsetY": 174.4,
                "type": "digital"
          },
          {
                "id": "K",
                "label": "K",
                "offsetX": 176,
                "offsetY": 174.4,
                "type": "digital"
          }
    ],
  },
  {
    idType: "display:ssd1306",
    wokwiTag: "wokwi-ssd1306",
    title: "OLED SSD1306 (128x64)",
    category: "Displays",
    categoryColor: "#38bdf8",
    description: "Monochrome 0.96 inch I2C/SPI OLED graphic screen (128x64 pixels) for crisp graphics & UI.",
    badge: "I2C 128x64",
    defaultProps: {},
    width: 120,
    height: 110,
    pins: [
          {
                "id": "DATA",
                "label": "DATA",
                "offsetX": 36.5,
                "offsetY": 12.5,
                "type": "digital"
          },
          {
                "id": "CLK",
                "label": "CLK",
                "offsetX": 45.5,
                "offsetY": 12.5,
                "type": "digital"
          },
          {
                "id": "DC",
                "label": "DC",
                "offsetX": 54.5,
                "offsetY": 12.5,
                "type": "digital"
          },
          {
                "id": "RST",
                "label": "RST",
                "offsetX": 64.5,
                "offsetY": 12.5,
                "type": "digital"
          },
          {
                "id": "CS",
                "label": "CS",
                "offsetX": 74.5,
                "offsetY": 12.5,
                "type": "digital"
          },
          {
                "id": "3V3",
                "label": "3V3",
                "offsetX": 83.5,
                "offsetY": 12.5,
                "type": "power"
          },
          {
                "id": "VIN",
                "label": "VIN",
                "offsetX": 93.5,
                "offsetY": 12.5,
                "type": "power"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 103.5,
                "offsetY": 12,
                "type": "ground"
          }
    ],
  },
  {
    idType: "display:ili9341",
    wokwiTag: "wokwi-ili9341",
    title: "TFT ILI9341 (320x240)",
    category: "Displays",
    categoryColor: "#6366f1",
    description: "2.8 inch 320x240 65K color SPI graphic TFT LCD panel with touchscreen.",
    badge: "Color SPI",
    defaultProps: {},
    width: 180,
    height: 160,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 48.3,
                "offsetY": 287.2,
                "type": "power"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 57.9,
                "offsetY": 287.2,
                "type": "ground"
          },
          {
                "id": "CS",
                "label": "CS",
                "offsetX": 67.5,
                "offsetY": 287.2,
                "type": "digital"
          },
          {
                "id": "RST",
                "label": "RST",
                "offsetX": 77.1,
                "offsetY": 287.2,
                "type": "digital"
          },
          {
                "id": "D/C",
                "label": "D/C",
                "offsetX": 86.7,
                "offsetY": 287.2,
                "type": "digital"
          },
          {
                "id": "MOSI",
                "label": "MOSI",
                "offsetX": 96.3,
                "offsetY": 287.2,
                "type": "digital"
          },
          {
                "id": "SCK",
                "label": "SCK",
                "offsetX": 105.9,
                "offsetY": 287.2,
                "type": "digital"
          },
          {
                "id": "LED",
                "label": "LED",
                "offsetX": 115.5,
                "offsetY": 287.2,
                "type": "digital"
          },
          {
                "id": "MISO",
                "label": "MISO",
                "offsetX": 125.1,
                "offsetY": 287.2,
                "type": "digital"
          }
    ],
  },
  {
    idType: "display:led-bar-graph",
    wokwiTag: "wokwi-led-bar-graph",
    title: "LED Bar Graph (10-Seg)",
    category: "Displays",
    categoryColor: "#10b981",
    description: "10 individual segment LED bar display for level meters, VU audio, and battery charge.",
    badge: "10 Segments",
    defaultProps: {},
    width: 80,
    height: 140,
    pins: [
          {
                "id": "A1",
                "label": "A1",
                "offsetX": 4.8,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "A2",
                "label": "A2",
                "offsetX": 4.8,
                "offsetY": 14.4,
                "type": "digital"
          },
          {
                "id": "A3",
                "label": "A3",
                "offsetX": 4.8,
                "offsetY": 24,
                "type": "digital"
          },
          {
                "id": "A4",
                "label": "A4",
                "offsetX": 4.8,
                "offsetY": 33.6,
                "type": "digital"
          },
          {
                "id": "A5",
                "label": "A5",
                "offsetX": 4.8,
                "offsetY": 43.2,
                "type": "digital"
          },
          {
                "id": "A6",
                "label": "A6",
                "offsetX": 4.8,
                "offsetY": 52.8,
                "type": "digital"
          },
          {
                "id": "A7",
                "label": "A7",
                "offsetX": 4.8,
                "offsetY": 62.4,
                "type": "digital"
          },
          {
                "id": "A8",
                "label": "A8",
                "offsetX": 4.8,
                "offsetY": 72,
                "type": "digital"
          },
          {
                "id": "A9",
                "label": "A9",
                "offsetX": 4.8,
                "offsetY": 81.6,
                "type": "digital"
          },
          {
                "id": "A10",
                "label": "A10",
                "offsetX": 4.8,
                "offsetY": 91.2,
                "type": "digital"
          },
          {
                "id": "C1",
                "label": "C1",
                "offsetX": 33.4,
                "offsetY": 4.8,
                "type": "digital"
          },
          {
                "id": "C2",
                "label": "C2",
                "offsetX": 33.4,
                "offsetY": 14.4,
                "type": "digital"
          },
          {
                "id": "C3",
                "label": "C3",
                "offsetX": 33.4,
                "offsetY": 24,
                "type": "digital"
          },
          {
                "id": "C4",
                "label": "C4",
                "offsetX": 33.4,
                "offsetY": 33.6,
                "type": "digital"
          },
          {
                "id": "C5",
                "label": "C5",
                "offsetX": 33.4,
                "offsetY": 43.2,
                "type": "digital"
          },
          {
                "id": "C6",
                "label": "C6",
                "offsetX": 33.4,
                "offsetY": 52.8,
                "type": "digital"
          },
          {
                "id": "C7",
                "label": "C7",
                "offsetX": 33.4,
                "offsetY": 62.4,
                "type": "digital"
          },
          {
                "id": "C8",
                "label": "C8",
                "offsetX": 33.4,
                "offsetY": 72,
                "type": "digital"
          },
          {
                "id": "C9",
                "label": "C9",
                "offsetX": 33.4,
                "offsetY": 81.6,
                "type": "digital"
          },
          {
                "id": "C10",
                "label": "C10",
                "offsetX": 33.4,
                "offsetY": 91.2,
                "type": "digital"
          }
    ],
  },
  {
    idType: "display:neopixel-matrix",
    wokwiTag: "wokwi-neopixel-matrix",
    title: "NeoPixel 8x8 Matrix",
    category: "Displays",
    categoryColor: "#ec4899",
    description: "64 individually addressable RGB LEDs (WS2812B) in an 8x8 square grid format.",
    badge: "64 RGB Pixels",
    defaultProps: {"rows":8,"cols":8},
    width: 140,
    height: 140,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 86.3,
                "offsetY": 181.4,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 95.9,
                "offsetY": 181.4,
                "type": "power"
          },
          {
                "id": "DIN",
                "label": "DIN",
                "offsetX": 105.5,
                "offsetY": 181.4,
                "type": "digital"
          },
          {
                "id": "DOUT",
                "label": "DOUT",
                "offsetX": 115.1,
                "offsetY": 181.4,
                "type": "digital"
          }
    ],
  },
  {
    idType: "display:neopixel-ring",
    wokwiTag: "wokwi-led-ring",
    title: "NeoPixel Ring (16-LED)",
    category: "Displays",
    categoryColor: "#a855f7",
    description: "16-LED circular WS2812B addressable RGB ring for visual gauges and mood lighting.",
    badge: "16 RGB Ring",
    defaultProps: {"pixels":16},
    width: 130,
    height: 130,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 56.4,
                "offsetY": 153,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 66,
                "offsetY": 153,
                "type": "power"
          },
          {
                "id": "DIN",
                "label": "DIN",
                "offsetX": 75.6,
                "offsetY": 153,
                "type": "digital"
          },
          {
                "id": "DOUT",
                "label": "DOUT",
                "offsetX": 85.2,
                "offsetY": 153,
                "type": "digital"
          }
    ],
  },
  {
    idType: "display:neopixel",
    wokwiTag: "wokwi-neopixel",
    title: "WS2812B NeoPixel Single",
    category: "Displays",
    categoryColor: "#d946ef",
    description: "Single smart 5050 RGB LED with built-in WS2812 driver IC, chainable with 1 pin.",
    badge: "Single RGB",
    defaultProps: {},
    width: 60,
    height: 60,
    pins: [
          {
                "id": "VDD",
                "label": "VDD",
                "offsetX": 1,
                "offsetY": 3.5,
                "type": "power"
          },
          {
                "id": "DOUT",
                "label": "DOUT",
                "offsetX": 1,
                "offsetY": 14,
                "type": "digital"
          },
          {
                "id": "VSS",
                "label": "VSS",
                "offsetX": 21,
                "offsetY": 14,
                "type": "ground"
          },
          {
                "id": "DIN",
                "label": "DIN",
                "offsetX": 21,
                "offsetY": 3.5,
                "type": "ground"
          }
    ],
  },
  {
    idType: "output:led",
    wokwiTag: "wokwi-led",
    title: "LED (Red)",
    category: "Outputs",
    categoryColor: "#ef4444",
    description: "Standard 5mm diffused light-emitting diode (Red, Forward Drop ~1.8V-2.0V).",
    badge: "5mm Red",
    defaultProps: {"color":"red"},
    width: 60,
    height: 90,
    pins: [
          {
                "id": "A",
                "label": "A",
                "offsetX": 25,
                "offsetY": 42,
                "type": "digital"
          },
          {
                "id": "C",
                "label": "C",
                "offsetX": 15,
                "offsetY": 42,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:led",
    wokwiTag: "wokwi-led",
    title: "LED (Green)",
    category: "Outputs",
    categoryColor: "#22c55e",
    description: "Standard 5mm diffused light-emitting diode (Green, Forward Drop ~2.2V).",
    badge: "5mm Green",
    defaultProps: {"color":"green"},
    width: 60,
    height: 90,
    pins: [
          {
                "id": "A",
                "label": "A",
                "offsetX": 25,
                "offsetY": 42,
                "type": "digital"
          },
          {
                "id": "C",
                "label": "C",
                "offsetX": 15,
                "offsetY": 42,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:led",
    wokwiTag: "wokwi-led",
    title: "LED (Yellow)",
    category: "Outputs",
    categoryColor: "#eab308",
    description: "Standard 5mm diffused light-emitting diode (Yellow/Amber, Forward Drop ~2.1V).",
    badge: "5mm Yellow",
    defaultProps: {"color":"yellow"},
    width: 60,
    height: 90,
    pins: [
          {
                "id": "A",
                "label": "A",
                "offsetX": 25,
                "offsetY": 42,
                "type": "digital"
          },
          {
                "id": "C",
                "label": "C",
                "offsetX": 15,
                "offsetY": 42,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:led",
    wokwiTag: "wokwi-led",
    title: "LED (Blue)",
    category: "Outputs",
    categoryColor: "#3b82f6",
    description: "Standard 5mm high-intensity light-emitting diode (Blue, Forward Drop ~3.2V).",
    badge: "5mm Blue",
    defaultProps: {"color":"blue"},
    width: 60,
    height: 90,
    pins: [
          {
                "id": "A",
                "label": "A",
                "offsetX": 25,
                "offsetY": 42,
                "type": "digital"
          },
          {
                "id": "C",
                "label": "C",
                "offsetX": 15,
                "offsetY": 42,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:led",
    wokwiTag: "wokwi-led",
    title: "LED (White)",
    category: "Outputs",
    categoryColor: "#f8fafc",
    description: "Standard 5mm high-intensity white light-emitting diode (Forward Drop ~3.0V).",
    badge: "5mm White",
    defaultProps: {"color":"white"},
    width: 60,
    height: 90,
    pins: [
          {
                "id": "A",
                "label": "A",
                "offsetX": 25,
                "offsetY": 42,
                "type": "digital"
          },
          {
                "id": "C",
                "label": "C",
                "offsetX": 15,
                "offsetY": 42,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:led",
    wokwiTag: "wokwi-led",
    title: "LED (Orange)",
    category: "Outputs",
    categoryColor: "#f97316",
    description: "Standard 5mm diffused orange light-emitting diode.",
    badge: "5mm Orange",
    defaultProps: {"color":"orange"},
    width: 60,
    height: 90,
    pins: [
          {
                "id": "A",
                "label": "A",
                "offsetX": 25,
                "offsetY": 42,
                "type": "digital"
          },
          {
                "id": "C",
                "label": "C",
                "offsetX": 15,
                "offsetY": 42,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:rgb-led",
    wokwiTag: "wokwi-rgb-led",
    title: "RGB LED (4-Pin)",
    category: "Outputs",
    categoryColor: "#f43f5e",
    description: "Common-Cathode 5mm RGB LED capable of mixing 16M colors via PWM signals.",
    badge: "4-Pin RGB",
    defaultProps: {},
    width: 70,
    height: 90,
    pins: [
          {
                "id": "R",
                "label": "R",
                "offsetX": 8.5,
                "offsetY": 44,
                "type": "digital"
          },
          {
                "id": "COM",
                "label": "COM",
                "offsetX": 18,
                "offsetY": 54,
                "type": "digital"
          },
          {
                "id": "G",
                "label": "G",
                "offsetX": 26.4,
                "offsetY": 44,
                "type": "digital"
          },
          {
                "id": "B",
                "label": "B",
                "offsetX": 35.7,
                "offsetY": 44,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:buzzer",
    wokwiTag: "wokwi-buzzer",
    title: "Piezo Buzzer",
    category: "Outputs",
    categoryColor: "#eab308",
    description: "Acoustic audio transducer supporting tone(pin, freq, duration) melody playback.",
    badge: "Piezo Tone",
    defaultProps: {},
    width: 80,
    height: 80,
    pins: [
          {
                "id": "1",
                "label": "1",
                "offsetX": 27,
                "offsetY": 84,
                "type": "digital"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 37,
                "offsetY": 84,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:speaker",
    wokwiTag: "custom-speaker",
    title: "Small Speaker (0.5W 8Ω)",
    category: "Outputs",
    categoryColor: "#eab308",
    description: "8-ohm dynamic speaker driven the same way as a piezo buzzer via tone(pin, freq, duration), but with a magnet/cone body instead of a piezo disc.",
    badge: "8Ω Dynamic",
    defaultProps: {},
    width: 70,
    height: 70,
    pins: [
      { id: "+", label: "+", offsetX: 22, offsetY: 66, type: "digital" },
      { id: "-", label: "-", offsetX: 42, offsetY: 66, type: "ground" },
    ],
  },
  {
    idType: "output:servo",
    wokwiTag: "wokwi-servo",
    title: "Micro Servo SG90",
    category: "Outputs",
    categoryColor: "#0284c7",
    description: "TowerPro 9g micro positional servo motor with 0°–180° precise rotational control.",
    badge: "9g 0-180°",
    defaultProps: {},
    width: 110,
    height: 90,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 0,
                "offsetY": 50,
                "type": "ground"
          },
          {
                "id": "V+",
                "label": "V+",
                "offsetX": 0,
                "offsetY": 59.5,
                "type": "power"
          },
          {
                "id": "PWM",
                "label": "PWM",
                "offsetX": 0,
                "offsetY": 69,
                "type": "signal"
          }
    ],
  },
  {
    idType: "output:dc-motor",
    wokwiTag: "custom-dc-motor",
    title: "DC Motor (with Propeller)",
    category: "Outputs",
    categoryColor: "#0284c7",
    description: "Standard brushed DC motor with 2-wire drive. Spins continuously while powered; direction depends on polarity.",
    badge: "3-6V DC",
    defaultProps: {},
    width: 80,
    height: 70,
    pins: [
      { id: "+", label: "+", offsetX: 20, offsetY: 60, type: "power" },
      { id: "-", label: "-", offsetX: 40, offsetY: 60, type: "ground" },
    ],
  },
  {
    idType: "output:stepper-motor",
    wokwiTag: "wokwi-stepper-motor",
    title: "Stepper Motor NEMA 17",
    category: "Outputs",
    categoryColor: "#475569",
    description: "Bipolar 4-wire stepper motor for CNC, 3D printers, robotics & high-torque positioning.",
    badge: "NEMA 17",
    defaultProps: {},
    width: 110,
    height: 110,
    pins: [
          {
                "id": "A-",
                "label": "A-",
                "offsetX": 95.1,
                "offsetY": 235.5,
                "type": "digital"
          },
          {
                "id": "A+",
                "label": "A+",
                "offsetX": 104.7,
                "offsetY": 235.5,
                "type": "digital"
          },
          {
                "id": "B+",
                "label": "B+",
                "offsetX": 114.3,
                "offsetY": 235.5,
                "type": "digital"
          },
          {
                "id": "B-",
                "label": "B-",
                "offsetX": 123.9,
                "offsetY": 235.5,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:biaxial-stepper",
    wokwiTag: "wokwi-biaxial-stepper",
    title: "Biaxial Stepper Gauge",
    category: "Outputs",
    categoryColor: "#0284c7",
    description: "Dual-axis concentric analog instrument gauge stepper motor for automotive clusters.",
    badge: "Dual Needle",
    defaultProps: {},
    width: 100,
    height: 100,
    pins: [
          {
                "id": "A1-",
                "label": "A1-",
                "offsetX": 45,
                "offsetY": 109.2,
                "type": "digital"
          },
          {
                "id": "A1+",
                "label": "A1+",
                "offsetX": 45,
                "offsetY": 118.8,
                "type": "digital"
          },
          {
                "id": "B1+",
                "label": "B1+",
                "offsetX": 45,
                "offsetY": 128.4,
                "type": "digital"
          },
          {
                "id": "B1-",
                "label": "B1-",
                "offsetX": 45,
                "offsetY": 138,
                "type": "digital"
          },
          {
                "id": "A2-",
                "label": "A2-",
                "offsetX": 45,
                "offsetY": 147.6,
                "type": "digital"
          },
          {
                "id": "A2+",
                "label": "A2+",
                "offsetX": 45,
                "offsetY": 157.2,
                "type": "digital"
          },
          {
                "id": "B2+",
                "label": "B2+",
                "offsetX": 45,
                "offsetY": 166.8,
                "type": "digital"
          },
          {
                "id": "B2-",
                "label": "B2-",
                "offsetX": 45,
                "offsetY": 176.5,
                "type": "digital"
          }
    ],
  },
  {
    idType: "output:relay",
    wokwiTag: "wokwi-ks2e-m-dc5",
    title: "5V Relay Module (KS2E)",
    category: "Outputs",
    categoryColor: "#e11d48",
    description: "Electromechanical SPDT 5V relay switch to safely control high-voltage AC/DC loads.",
    badge: "5V SPDT Relay",
    defaultProps: {},
    width: 90,
    height: 80,
    pins: [
          {
                "id": "NO2",
                "label": "NO2",
                "offsetX": 5.5,
                "offsetY": 5.1,
                "type": "digital"
          },
          {
                "id": "NC2",
                "label": "NC2",
                "offsetX": 25,
                "offsetY": 5.1,
                "type": "digital"
          },
          {
                "id": "P2",
                "label": "P2",
                "offsetX": 45,
                "offsetY": 5.1,
                "type": "digital"
          },
          {
                "id": "COIL2",
                "label": "COIL2",
                "offsetX": 74,
                "offsetY": 5.1,
                "type": "ground"
          },
          {
                "id": "NO1",
                "label": "NO1",
                "offsetX": 5.5,
                "offsetY": 32.7,
                "type": "digital"
          },
          {
                "id": "NC1",
                "label": "NC1",
                "offsetX": 25,
                "offsetY": 32.7,
                "type": "digital"
          },
          {
                "id": "P1",
                "label": "P1",
                "offsetX": 45,
                "offsetY": 32.7,
                "type": "digital"
          },
          {
                "id": "COIL1",
                "label": "COIL1",
                "offsetX": 74,
                "offsetY": 32.7,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:analog-joystick",
    wokwiTag: "wokwi-analog-joystick",
    title: "Analog Joystick Module",
    category: "Sensors",
    categoryColor: "#0284c7",
    description: "Dual-axis (X/Y) thumb potentiometer joystick with integrated tactile pushbutton click.",
    badge: "2-Axis + Click",
    defaultProps: {},
    width: 100,
    height: 100,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 33,
                "offsetY": 115.8,
                "type": "power"
          },
          {
                "id": "VERT",
                "label": "VERT",
                "offsetX": 42.6,
                "offsetY": 115.8,
                "type": "analog"
          },
          {
                "id": "HORZ",
                "label": "HORZ",
                "offsetX": 52.2,
                "offsetY": 115.8,
                "type": "analog"
          },
          {
                "id": "SEL",
                "label": "SEL",
                "offsetX": 61.8,
                "offsetY": 115.8,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 71.4,
                "offsetY": 115.8,
                "type": "ground"
          }
    ],
  },
  {
    idType: "input:sound-sensor",
    wokwiTag: "wokwi-big-sound-sensor",
    title: "Big Sound Microphone Sensor",
    category: "Sensors",
    categoryColor: "#10b981",
    description: "High sensitivity electret microphone module with LM393 comparator (AO & DO).",
    badge: "Audio Mic LM393",
    defaultProps: {},
    width: 90,
    height: 90,
    pins: [
          {
                "id": "AOUT",
                "label": "AOUT",
                "offsetX": 0,
                "offsetY": 11,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 0,
                "offsetY": 20.5,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 0,
                "offsetY": 30.5,
                "type": "power"
          },
          {
                "id": "DOUT",
                "label": "DOUT",
                "offsetX": 0,
                "offsetY": 40.5,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:small-sound-sensor",
    wokwiTag: "wokwi-small-sound-sensor",
    title: "Small Sound Microphone Sensor",
    category: "Sensors",
    categoryColor: "#10b981",
    description: "Compact microphone audio sound level detection module with analog & digital outputs.",
    badge: "Mini Audio Mic",
    defaultProps: {},
    width: 80,
    height: 80,
    pins: [
          {
                "id": "AOUT",
                "label": "AOUT",
                "offsetX": 0,
                "offsetY": 11,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 0,
                "offsetY": 20.5,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 0,
                "offsetY": 30.5,
                "type": "power"
          },
          {
                "id": "DOUT",
                "label": "DOUT",
                "offsetX": 0,
                "offsetY": 40.5,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:dht22",
    wokwiTag: "wokwi-dht22",
    title: "DHT22 / AM2302 Sensor",
    category: "Sensors",
    categoryColor: "#059669",
    description: "Digital capacitive temperature (-40°C to +80°C) and relative humidity (0-100%) sensor.",
    badge: "Temp & Humidity",
    defaultProps: {"temperature":24,"humidity":45},
    width: 80,
    height: 90,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 15,
                "offsetY": 114.9,
                "type": "power"
          },
          {
                "id": "SDA",
                "label": "SDA",
                "offsetX": 24.5,
                "offsetY": 114.9,
                "type": "digital"
          },
          {
                "id": "NC",
                "label": "NC",
                "offsetX": 34.1,
                "offsetY": 114.9,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 43.8,
                "offsetY": 114.9,
                "type": "ground"
          }
    ],
  },
  {
    idType: "input:ds1307",
    wokwiTag: "wokwi-ds1307",
    title: "DS1307 RTC Clock Module",
    category: "Sensors",
    categoryColor: "#059669",
    description: "Real-Time Clock (RTC) I2C module with battery backup maintaining time, date, and calendar.",
    badge: "I2C RTC Time",
    defaultProps: {},
    width: 80,
    height: 80,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 9.5,
                "offsetY": 15,
                "type": "ground"
          },
          {
                "id": "5V",
                "label": "5V",
                "offsetX": 9.5,
                "offsetY": 25,
                "type": "power"
          },
          {
                "id": "SDA",
                "label": "SDA",
                "offsetX": 9.5,
                "offsetY": 34.5,
                "type": "digital"
          },
          {
                "id": "SCL",
                "label": "SCL",
                "offsetX": 9.5,
                "offsetY": 44,
                "type": "digital"
          },
          {
                "id": "SQW",
                "label": "SQW",
                "offsetX": 9.5,
                "offsetY": 54,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:flame-sensor",
    wokwiTag: "wokwi-flame-sensor",
    title: "Flame Sensor Module",
    category: "Sensors",
    categoryColor: "#dc2626",
    description: "High-sensitivity infrared photodiode module responsive to fire flame wavelength (760-1100nm).",
    badge: "Fire Detection",
    defaultProps: {},
    width: 80,
    height: 80,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 199,
                "offsetY": 14.6,
                "type": "power"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 199,
                "offsetY": 24.3,
                "type": "ground"
          },
          {
                "id": "DOUT",
                "label": "DOUT",
                "offsetX": 199,
                "offsetY": 34,
                "type": "digital"
          },
          {
                "id": "AOUT",
                "label": "AOUT",
                "offsetX": 199,
                "offsetY": 43.7,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:gas-sensor",
    wokwiTag: "wokwi-gas-sensor",
    title: "MQ-2 Gas / Smoke Sensor",
    category: "Sensors",
    categoryColor: "#d97706",
    description: "SnO2 semiconductor gas sensor detecting LPG, propane, methane, alcohol, and smoke.",
    badge: "Gas & Smoke",
    defaultProps: {},
    width: 90,
    height: 90,
    pins: [
          {
                "id": "AOUT",
                "label": "AOUT",
                "offsetX": 137,
                "offsetY": 16.5,
                "type": "digital"
          },
          {
                "id": "DOUT",
                "label": "DOUT",
                "offsetX": 137,
                "offsetY": 26.4,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 137,
                "offsetY": 36.5,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 137,
                "offsetY": 46.2,
                "type": "power"
          }
    ],
  },
  {
    idType: "input:hc-sr04",
    wokwiTag: "wokwi-hc-sr04",
    title: "HC-SR04 Ultrasonic Sonar",
    category: "Sensors",
    categoryColor: "#0284c7",
    description: "40kHz ultrasonic echo distance sonar sensor (2cm to 400cm range, ~3mm accuracy).",
    badge: "Sonar Distance",
    defaultProps: {"distance":50},
    width: 120,
    height: 80,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 71.3,
                "offsetY": 94.5,
                "type": "power"
          },
          {
                "id": "TRIG",
                "label": "TRIG",
                "offsetX": 81.3,
                "offsetY": 94.5,
                "type": "digital"
          },
          {
                "id": "ECHO",
                "label": "ECHO",
                "offsetX": 91.3,
                "offsetY": 94.5,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 101.3,
                "offsetY": 94.5,
                "type": "ground"
          }
    ],
  },
  {
    idType: "input:heart-beat",
    wokwiTag: "wokwi-heart-beat-sensor",
    title: "Heartbeat Pulse Sensor",
    category: "Sensors",
    categoryColor: "#e11d48",
    description: "Optical photoplethysmography sensor measuring heart rate pulse through fingertip blood flow.",
    badge: "Pulse BPM",
    defaultProps: {},
    width: 70,
    height: 70,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 87,
                "offsetY": 17.8,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 87,
                "offsetY": 27.5,
                "type": "power"
          },
          {
                "id": "OUT",
                "label": "OUT",
                "offsetX": 87,
                "offsetY": 37.5,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:hx711",
    wokwiTag: "wokwi-hx711",
    title: "HX711 Weight Scale ADC",
    category: "Sensors",
    categoryColor: "#475569",
    description: "24-bit high precision ADC amplifier module for strain gauge load cells & digital scales.",
    badge: "24-bit Scale",
    defaultProps: {},
    width: 80,
    height: 80,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 7,
                "offsetY": 55,
                "type": "power"
          },
          {
                "id": "DT",
                "label": "DT",
                "offsetX": 7,
                "offsetY": 36.3,
                "type": "digital"
          },
          {
                "id": "SCK",
                "label": "SCK",
                "offsetX": 7,
                "offsetY": 46.2,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 7,
                "offsetY": 26.5,
                "type": "ground"
          }
    ],
  },
  {
    idType: "input:ir-receiver",
    wokwiTag: "wokwi-ir-receiver",
    title: "IR Infrared Receiver (38kHz)",
    category: "Sensors",
    categoryColor: "#6366f1",
    description: "38kHz demodulating infrared receiver sensor for decoding wireless handheld remotes.",
    badge: "38kHz IR",
    defaultProps: {},
    width: 70,
    height: 70,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 21,
                "offsetY": 87.8,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 30.6,
                "offsetY": 87.8,
                "type": "power"
          },
          {
                "id": "DAT",
                "label": "DAT",
                "offsetX": 40.2,
                "offsetY": 87.8,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:ir-remote",
    wokwiTag: "wokwi-ir-remote",
    title: "IR Wireless Remote Handset",
    category: "Sensors",
    categoryColor: "#4f46e5",
    description: "Standard 21-button infrared handheld transmitter remote using NEC protocol.",
    badge: "21-Key NEC Remote",
    defaultProps: {},
    width: 100,
    height: 180,
    pins: [],
  },
  {
    idType: "input:ky-040",
    wokwiTag: "wokwi-ky-040",
    title: "Rotary Encoder (KY-040)",
    category: "Sensors",
    categoryColor: "#7c3aed",
    description: "Incremental 360° rotary encoder with quadrature 2-phase outputs (CLK/DT) & pushbutton switch.",
    badge: "360° Encoder",
    defaultProps: {},
    width: 80,
    height: 90,
    pins: [
          {
                "id": "CLK",
                "label": "CLK",
                "offsetX": 116,
                "offsetY": 7.9,
                "type": "digital"
          },
          {
                "id": "DT",
                "label": "DT",
                "offsetX": 116,
                "offsetY": 17.4,
                "type": "digital"
          },
          {
                "id": "SW",
                "label": "SW",
                "offsetX": 116,
                "offsetY": 27,
                "type": "digital"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 116,
                "offsetY": 36.3,
                "type": "power"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 116,
                "offsetY": 45.5,
                "type": "ground"
          }
    ],
  },
  {
    idType: "input:mpu6050",
    wokwiTag: "wokwi-mpu6050",
    title: "MPU-6050 6-DOF IMU",
    category: "Sensors",
    categoryColor: "#6366f1",
    description: "Integrated 3-axis MEMS accelerometer + 3-axis angular rate gyroscope (I2C interface).",
    badge: "Gyro + Accel",
    defaultProps: {},
    width: 90,
    height: 90,
    pins: [
          {
                "id": "INT",
                "label": "INT",
                "offsetX": 7.3,
                "offsetY": 5.8,
                "type": "digital"
          },
          {
                "id": "AD0",
                "label": "AD0",
                "offsetX": 16.9,
                "offsetY": 5.8,
                "type": "digital"
          },
          {
                "id": "XCL",
                "label": "XCL",
                "offsetX": 26.4,
                "offsetY": 5.8,
                "type": "digital"
          },
          {
                "id": "XDA",
                "label": "XDA",
                "offsetX": 36,
                "offsetY": 5.8,
                "type": "digital"
          },
          {
                "id": "SDA",
                "label": "SDA",
                "offsetX": 45.6,
                "offsetY": 5.8,
                "type": "digital"
          },
          {
                "id": "SCL",
                "label": "SCL",
                "offsetX": 55.2,
                "offsetY": 5.8,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 64.8,
                "offsetY": 5.8,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 74.4,
                "offsetY": 5.8,
                "type": "power"
          }
    ],
  },
  {
    idType: "input:ntc-temperature",
    wokwiTag: "wokwi-ntc-temperature-sensor",
    title: "NTC Thermistor Temperature",
    category: "Sensors",
    categoryColor: "#0284c7",
    description: "Negative Temperature Coefficient 10k thermistor for analog thermal monitoring.",
    badge: "Analog Temp",
    defaultProps: {},
    width: 70,
    height: 70,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 135,
                "offsetY": 26.2,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 135,
                "offsetY": 35.8,
                "type": "power"
          },
          {
                "id": "OUT",
                "label": "OUT",
                "offsetX": 135,
                "offsetY": 45.5,
                "type": "analog"
          }
    ],
  },
  {
    idType: "input:photoresistor",
    wokwiTag: "wokwi-photoresistor-sensor",
    title: "Photoresistor Light Sensor (LDR)",
    category: "Sensors",
    categoryColor: "#ea580c",
    description: "Cadmium-Sulfide (CdS) 5mm light-dependent resistor for ambient light detection.",
    badge: "Analog Light",
    defaultProps: {"lightLevel":450},
    width: 70,
    height: 80,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 172,
                "offsetY": 16,
                "type": "power"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 172,
                "offsetY": 26,
                "type": "ground"
          },
          {
                "id": "DO",
                "label": "DO",
                "offsetX": 172,
                "offsetY": 35.8,
                "type": "digital"
          },
          {
                "id": "AO",
                "label": "AO",
                "offsetX": 172,
                "offsetY": 45.5,
                "type": "analog"
          }
    ],
  },
  {
    idType: "input:pir-motion",
    wokwiTag: "wokwi-pir-motion-sensor",
    title: "PIR Motion Detector Sensor",
    category: "Sensors",
    categoryColor: "#f59e0b",
    description: "Passive infrared pyroelectric detector sensing human and thermal motion up to 7 meters.",
    badge: "Infrared Motion",
    defaultProps: {},
    width: 90,
    height: 90,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 36.2,
                "offsetY": 92,
                "type": "power"
          },
          {
                "id": "OUT",
                "label": "OUT",
                "offsetX": 45.9,
                "offsetY": 92,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 55.6,
                "offsetY": 92,
                "type": "ground"
          }
    ],
  },
  {
    idType: "input:potentiometer",
    wokwiTag: "wokwi-potentiometer",
    title: "Potentiometer (10kΩ Rotary)",
    category: "Sensors",
    categoryColor: "#0284c7",
    description: "Rotary variable voltage divider providing 0V–5V analog signal proportional to dial angle.",
    badge: "10kΩ Rotary",
    defaultProps: {"potValue":512},
    width: 80,
    height: 80,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 29,
                "offsetY": 68.5,
                "type": "ground"
          },
          {
                "id": "SIG",
                "label": "SIG",
                "offsetX": 39,
                "offsetY": 68.5,
                "type": "analog"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 49,
                "offsetY": 68.5,
                "type": "power"
          }
    ],
  },
  {
    idType: "input:slide-potentiometer",
    wokwiTag: "wokwi-slide-potentiometer",
    title: "Slide Potentiometer Fader",
    category: "Sensors",
    categoryColor: "#0369a1",
    description: "Linear sliding fader potentiometer for audio mixers and throttle controls.",
    badge: "Linear Fader",
    defaultProps: {"potValue":512},
    width: 140,
    height: 60,
    pins: [
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 1,
                "offsetY": 43,
                "type": "power"
          },
          {
                "id": "SIG",
                "label": "SIG",
                "offsetX": 1,
                "offsetY": 63,
                "type": "analog"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 207,
                "offsetY": 43,
                "type": "ground"
          }
    ],
  },
  {
    idType: "input:tilt-switch",
    wokwiTag: "wokwi-tilt-switch",
    title: "Ball Tilt Switch Sensor",
    category: "Sensors",
    categoryColor: "#64748b",
    description: "Internal metallic ball tilt detector signaling orientation inversion & tipping.",
    badge: "Orientation",
    defaultProps: {},
    width: 70,
    height: 70,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 88,
                "offsetY": 18,
                "type": "ground"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 88,
                "offsetY": 27.8,
                "type": "power"
          },
          {
                "id": "OUT",
                "label": "OUT",
                "offsetX": 88,
                "offsetY": 37.5,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:pushbutton",
    wokwiTag: "wokwi-pushbutton",
    title: "Tactile Pushbutton (12mm)",
    category: "Switches",
    categoryColor: "#2563eb",
    description: "Tactile momentary SPST push button switch for triggering triggers, resets, and inputs.",
    badge: "Momentary 12mm",
    defaultProps: {"color":"red"},
    width: 70,
    height: 70,
    pins: [
          {
                "id": "1.l",
                "label": "1.l",
                "offsetX": 0,
                "offsetY": 13,
                "type": "digital"
          },
          {
                "id": "2.l",
                "label": "2.l",
                "offsetX": 0,
                "offsetY": 32,
                "type": "digital"
          },
          {
                "id": "1.r",
                "label": "1.r",
                "offsetX": 67,
                "offsetY": 13,
                "type": "digital"
          },
          {
                "id": "2.r",
                "label": "2.r",
                "offsetX": 67,
                "offsetY": 32,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:pushbutton-6mm",
    wokwiTag: "wokwi-pushbutton-6mm",
    title: "Mini Tactile Button (6mm)",
    category: "Switches",
    categoryColor: "#3b82f6",
    description: "Compact 6mm PCB tactile pushbutton switch for space-constrained interfaces.",
    badge: "Compact 6mm",
    defaultProps: {},
    width: 50,
    height: 50,
    pins: [
          {
                "id": "1.l",
                "label": "1.l",
                "offsetX": 0,
                "offsetY": 2.2,
                "type": "digital"
          },
          {
                "id": "2.l",
                "label": "2.l",
                "offsetX": 0,
                "offsetY": 21,
                "type": "digital"
          },
          {
                "id": "1.r",
                "label": "1.r",
                "offsetX": 28,
                "offsetY": 2.2,
                "type": "digital"
          },
          {
                "id": "2.r",
                "label": "2.r",
                "offsetX": 28,
                "offsetY": 21,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:slide-switch",
    wokwiTag: "wokwi-slide-switch",
    title: "Slide Switch (SPDT)",
    category: "Switches",
    categoryColor: "#0284c7",
    description: "Single-Pole Double-Throw (SPDT) latching slide switch for power toggles and mode selectors.",
    badge: "Latching SPDT",
    defaultProps: {},
    width: 60,
    height: 60,
    pins: [
          {
                "id": "1",
                "label": "1",
                "offsetX": 6.5,
                "offsetY": 34,
                "type": "digital"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 16,
                "offsetY": 34,
                "type": "digital"
          },
          {
                "id": "3",
                "label": "3",
                "offsetX": 25.5,
                "offsetY": 34,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:dip-switch-8",
    wokwiTag: "wokwi-dip-switch-8",
    title: "8-Position DIP Switch Bank",
    category: "Switches",
    categoryColor: "#dc2626",
    description: "8-bit dual in-line package rocker switch bank for binary address & configuration settings.",
    badge: "8-Bit DIP",
    defaultProps: {},
    width: 120,
    height: 70,
    pins: [
          {
                "id": "1a",
                "label": "1a",
                "offsetX": 8.1,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "2a",
                "label": "2a",
                "offsetX": 17.7,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "3a",
                "label": "3a",
                "offsetX": 27.3,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "4a",
                "label": "4a",
                "offsetX": 36.9,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "5a",
                "label": "5a",
                "offsetX": 46.5,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "6a",
                "label": "6a",
                "offsetX": 56.1,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "7a",
                "label": "7a",
                "offsetX": 65.7,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "8a",
                "label": "8a",
                "offsetX": 75.3,
                "offsetY": 51.3,
                "type": "digital"
          },
          {
                "id": "8b",
                "label": "8b",
                "offsetX": 75.3,
                "offsetY": 3,
                "type": "digital"
          },
          {
                "id": "7b",
                "label": "7b",
                "offsetX": 65.7,
                "offsetY": 3,
                "type": "digital"
          },
          {
                "id": "6b",
                "label": "6b",
                "offsetX": 56.1,
                "offsetY": 3,
                "type": "digital"
          },
          {
                "id": "5b",
                "label": "5b",
                "offsetX": 46.5,
                "offsetY": 3,
                "type": "digital"
          },
          {
                "id": "4b",
                "label": "4b",
                "offsetX": 36.9,
                "offsetY": 3,
                "type": "digital"
          },
          {
                "id": "3b",
                "label": "3b",
                "offsetX": 27.3,
                "offsetY": 3,
                "type": "digital"
          },
          {
                "id": "2b",
                "label": "2b",
                "offsetX": 17.7,
                "offsetY": 3,
                "type": "digital"
          },
          {
                "id": "1b",
                "label": "1b",
                "offsetX": 8.1,
                "offsetY": 3,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:membrane-keypad",
    wokwiTag: "wokwi-membrane-keypad",
    title: "4x4 Matrix Keypad",
    category: "Switches",
    categoryColor: "#475569",
    description: "16-button matrix membrane keypad (0-9, *, #, A-D) for passcode entry and alphanumeric PINs.",
    badge: "16 Keys (4x4)",
    defaultProps: {},
    width: 130,
    height: 140,
    pins: [
          {
                "id": "R1",
                "label": "R1",
                "offsetX": 100,
                "offsetY": 338,
                "type": "digital"
          },
          {
                "id": "R2",
                "label": "R2",
                "offsetX": 110,
                "offsetY": 338,
                "type": "digital"
          },
          {
                "id": "R3",
                "label": "R3",
                "offsetX": 119.5,
                "offsetY": 338,
                "type": "digital"
          },
          {
                "id": "R4",
                "label": "R4",
                "offsetX": 129,
                "offsetY": 338,
                "type": "digital"
          },
          {
                "id": "C1",
                "label": "C1",
                "offsetX": 138.5,
                "offsetY": 338,
                "type": "digital"
          },
          {
                "id": "C2",
                "label": "C2",
                "offsetX": 148,
                "offsetY": 338,
                "type": "digital"
          },
          {
                "id": "C3",
                "label": "C3",
                "offsetX": 157.8,
                "offsetY": 338,
                "type": "digital"
          },
          {
                "id": "C4",
                "label": "C4",
                "offsetX": 167.5,
                "offsetY": 338,
                "type": "digital"
          }
    ],
  },
  {
    idType: "input:rotary-dialer",
    wokwiTag: "wokwi-rotary-dialer",
    title: "Vintage Rotary Dialer",
    category: "Switches",
    categoryColor: "#78350f",
    description: "Mechanical telephone pulse dialing wheel generating calibrated contact pulses.",
    badge: "Pulse Wheel",
    defaultProps: {},
    width: 110,
    height: 110,
    pins: [
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 122,
                "offsetY": 286,
                "type": "ground"
          },
          {
                "id": "DIAL",
                "label": "DIAL",
                "offsetX": 131.6,
                "offsetY": 286,
                "type": "digital"
          },
          {
                "id": "PULSE",
                "label": "PULSE",
                "offsetX": 141.2,
                "offsetY": 286,
                "type": "digital"
          }
    ],
  },
  {
    idType: "passive:resistor",
    wokwiTag: "wokwi-resistor",
    title: "Resistor (220Ω)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "Current limiting through-hole resistor (220Ω, Red-Red-Brown-Gold) for 5V LED protection.",
    badge: "220Ω (LED Limit)",
    defaultProps: {"value":"220"},
    width: 80,
    height: 40,
    pins: [
          {
                "id": "1",
                "label": "1",
                "offsetX": 0,
                "offsetY": 5.7,
                "type": "digital"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 58.8,
                "offsetY": 5.7,
                "type": "digital"
          }
    ],
  },
  {
    idType: "passive:resistor",
    wokwiTag: "wokwi-resistor",
    title: "Resistor (1kΩ)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "1kΩ general purpose passive resistor (Brown-Black-Red-Gold) for transistor base bias.",
    badge: "1kΩ Resistor",
    defaultProps: {"value":"1000"},
    width: 80,
    height: 40,
    pins: [
          {
                "id": "1",
                "label": "1",
                "offsetX": 0,
                "offsetY": 5.7,
                "type": "digital"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 58.8,
                "offsetY": 5.7,
                "type": "digital"
          }
    ],
  },
  {
    idType: "passive:resistor",
    wokwiTag: "wokwi-resistor",
    title: "Resistor (10kΩ)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "Pull-up / pull-down bias resistor (10kΩ, Brown-Black-Orange-Gold) for digital and LDR nets.",
    badge: "10kΩ (Pull-up)",
    defaultProps: {"value":"10k"},
    width: 80,
    height: 40,
    pins: [
          {
                "id": "1",
                "label": "1",
                "offsetX": 0,
                "offsetY": 5.7,
                "type": "digital"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 58.8,
                "offsetY": 5.7,
                "type": "digital"
          }
    ],
  },
  {
    idType: "passive:resistor",
    wokwiTag: "wokwi-resistor",
    title: "Resistor (100kΩ)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "100kΩ high impedance bias resistor (Brown-Black-Yellow-Gold).",
    badge: "100kΩ Resistor",
    defaultProps: {"value":"100k"},
    width: 80,
    height: 40,
    pins: [
          {
                "id": "1",
                "label": "1",
                "offsetX": 0,
                "offsetY": 5.7,
                "type": "digital"
          },
          {
                "id": "2",
                "label": "2",
                "offsetX": 58.8,
                "offsetY": 5.7,
                "type": "digital"
          }
    ],
  },
  {
    idType: "passive:capacitor-ceramic",
    wokwiTag: "custom-capacitor-ceramic",
    title: "Ceramic Capacitor (100nF)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "Non-polarized ceramic disc capacitor, commonly used for decoupling/bypass near IC power pins.",
    badge: "100nF",
    defaultProps: { value: "100nF" },
    width: 40,
    height: 44,
    pins: [
      { id: "1", label: "1", offsetX: 8, offsetY: 40, type: "digital" },
      { id: "2", label: "2", offsetX: 32, offsetY: 40, type: "digital" },
    ],
  },
  {
    idType: "passive:capacitor-electrolytic",
    wokwiTag: "custom-capacitor-electrolytic",
    title: "Electrolytic Capacitor (100μF)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "Polarized electrolytic capacitor for power smoothing/filtering. Longer lead (+) must not be reverse-wired.",
    badge: "100μF",
    defaultProps: { value: "100uF" },
    width: 36,
    height: 50,
    pins: [
      { id: "+", label: "+", offsetX: 6, offsetY: 46, type: "digital" },
      { id: "-", label: "-", offsetX: 30, offsetY: 46, type: "ground" },
    ],
  },
  {
    idType: "passive:diode",
    wokwiTag: "custom-diode",
    title: "Diode (1N4001)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "General-purpose rectifier diode. Conducts anode-to-cathode only - commonly used to protect against back-EMF from relay/motor coils.",
    badge: "1N4001",
    defaultProps: {},
    width: 50,
    height: 24,
    pins: [
      { id: "A", label: "A", offsetX: 0, offsetY: 12, type: "digital" },
      { id: "K", label: "K", offsetX: 50, offsetY: 12, type: "digital" },
    ],
  },
  {
    idType: "passive:transistor-npn",
    wokwiTag: "custom-transistor-npn",
    title: "NPN Transistor (2N2222)",
    category: "Passives",
    categoryColor: "#a27b5c",
    description: "General-purpose NPN switching transistor (TO-92). A HIGH base current lets collector-emitter conduct - the standard way to drive motors/relays/high-current loads from a digital pin.",
    badge: "2N2222",
    defaultProps: {},
    width: 44,
    height: 46,
    pins: [
      { id: "E", label: "E", offsetX: 6, offsetY: 44, type: "ground" },
      { id: "B", label: "B", offsetX: 22, offsetY: 44, type: "digital" },
      { id: "C", label: "C", offsetX: 38, offsetY: 44, type: "power" },
    ],
  },
  {
    idType: "storage:microsd-card",
    wokwiTag: "wokwi-microsd-card",
    title: "MicroSD Card SPI Module",
    category: "Passives",
    categoryColor: "#0284c7",
    description: "MicroSD flash storage interface via SPI (FAT16/FAT32 datalogging & file storage).",
    badge: "SPI Storage",
    defaultProps: {},
    width: 90,
    height: 90,
    pins: [
          {
                "id": "CD",
                "label": "CD",
                "offsetX": 76.7,
                "offsetY": 9.4,
                "type": "digital"
          },
          {
                "id": "DO",
                "label": "DO",
                "offsetX": 76.7,
                "offsetY": 18.9,
                "type": "digital"
          },
          {
                "id": "GND",
                "label": "GND",
                "offsetX": 76.7,
                "offsetY": 28.5,
                "type": "ground"
          },
          {
                "id": "SCK",
                "label": "SCK",
                "offsetX": 76.7,
                "offsetY": 38.2,
                "type": "digital"
          },
          {
                "id": "VCC",
                "label": "VCC",
                "offsetX": 76.7,
                "offsetY": 47.6,
                "type": "power"
          },
          {
                "id": "DI",
                "label": "DI",
                "offsetX": 76.7,
                "offsetY": 57.5,
                "type": "digital"
          },
          {
                "id": "CS",
                "label": "CS",
                "offsetX": 76.7,
                "offsetY": 66.9,
                "type": "digital"
          }
    ],
  },
];

export function getWokwiItem(type: ComponentType, props?: Record<string, any>): WokwiItemDefinition | undefined {
  if (type === "output:led" && props?.color) {
    const item = WOKWI_CATALOG.find((w) => w.idType === type && w.defaultProps.color === props.color);
    if (item) return item;
  }
  if (type === "passive:resistor" && props?.value) {
    const item = WOKWI_CATALOG.find((w) => w.idType === type && w.defaultProps.value === props.value);
    if (item) return item;
  }
  return WOKWI_CATALOG.find((w) => w.idType === type);
}
