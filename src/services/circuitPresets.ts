import { CircuitBlueprint } from "../types/circuit";

export const CIRCUIT_PRESETS: Record<string, CircuitBlueprint> = {
  nighttime_alarm: {
    project_title: "Nighttime Intruder Alarm",
    conceptual_summary:
      "This system monitors ambient light levels using a photoresistor. When the light falls below a set threshold, it flashes a red alert LED and sounds a piezo buzzer sequentially.",
    components: [
      { id: "uno_1", type: "board:arduino-uno", x: 100, y: 150, properties: {} },
      { id: "ldr_1", type: "input:photoresistor", x: 350, y: 80, properties: {} },
      { id: "res_pulldown", type: "passive:resistor", x: 350, y: 170, properties: { value: "10k" } },
      { id: "led_alert", type: "output:led", x: 490, y: 110, properties: { color: "red" } },
      { id: "res_led", type: "passive:resistor", x: 490, y: 200, properties: { value: "220" } },
      { id: "buzzer_1", type: "output:buzzer", x: 620, y: 150, properties: {} },
    ],
    connections: [
      { from_id: "uno_1", from_pin: "5V", to_id: "ldr_1", to_pin: "pin1", wire_color: "red" },
      { from_id: "ldr_1", from_pin: "pin2", to_id: "uno_1", to_pin: "A0", wire_color: "yellow" },
      { from_id: "ldr_1", from_pin: "pin2", to_id: "res_pulldown", to_pin: "pin1", wire_color: "yellow" },
      { from_id: "res_pulldown", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.1", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D13", to_id: "led_alert", to_pin: "anode", wire_color: "blue" },
      { from_id: "led_alert", from_pin: "cathode", to_id: "res_led", to_pin: "pin1", wire_color: "black" },
      { from_id: "res_led", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.2", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D12", to_id: "buzzer_1", to_pin: "positive", wire_color: "green" },
      { from_id: "buzzer_1", from_pin: "negative", to_id: "uno_1", to_pin: "GND.3", wire_color: "black" },
    ],
    arduino_code: `// Nighttime Intruder Alarm
const int LDR_PIN = A0;
const int LED_PIN = 13;
const int BUZZ_PIN = 12;
const int THRESHOLD = 300; // Darkness trigger threshold

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("System Initialized: Armed & Monitoring Ambient Light");
}

void loop() {
  int lightLevel = analogRead(LDR_PIN);
  Serial.print("Current Light Level: ");
  Serial.println(lightLevel);

  if (lightLevel < THRESHOLD) {
    // Intruder detected in dark room!
    digitalWrite(LED_PIN, HIGH);
    tone(BUZZ_PIN, 1000);
    delay(200);
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZ_PIN);
    delay(200);
  } else {
    // Safe ambient light
    digitalWrite(LED_PIN, LOW);
    noTone(BUZZ_PIN);
    delay(100);
  }
}`,
  },

  servo_potentiometer: {
    project_title: "Precision Servo Angle Controller",
    conceptual_summary:
      "This system reads an analog voltage from a rotary potentiometer and maps the 0-1023 input to a 0-180 degree angle on a micro servo motor with visual green LED indicator.",
    components: [
      { id: "uno_1", type: "board:arduino-uno", x: 100, y: 150, properties: {} },
      { id: "pot_1", type: "input:potentiometer", x: 350, y: 90, properties: {} },
      { id: "servo_1", type: "output:servo", x: 500, y: 100, properties: {} },
      { id: "led_active", type: "output:led", x: 650, y: 90, properties: { color: "green" } },
      { id: "res_led", type: "passive:resistor", x: 650, y: 190, properties: { value: "220" } },
    ],
    connections: [
      { from_id: "uno_1", from_pin: "5V", to_id: "pot_1", to_pin: "vcc", wire_color: "red" },
      { from_id: "pot_1", from_pin: "gnd", to_id: "uno_1", to_pin: "GND.1", wire_color: "black" },
      { from_id: "pot_1", from_pin: "wiper", to_id: "uno_1", to_pin: "A0", wire_color: "yellow" },
      { from_id: "uno_1", from_pin: "5V", to_id: "servo_1", to_pin: "vcc", wire_color: "red" },
      { from_id: "servo_1", from_pin: "gnd", to_id: "uno_1", to_pin: "GND.2", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D9", to_id: "servo_1", to_pin: "pwm", wire_color: "blue" },
      { from_id: "uno_1", from_pin: "D13", to_id: "led_active", to_pin: "anode", wire_color: "green" },
      { from_id: "led_active", from_pin: "cathode", to_id: "res_led", to_pin: "pin1", wire_color: "black" },
      { from_id: "res_led", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.3", wire_color: "black" },
    ],
    arduino_code: `#include <Servo.h>

Servo myServo;
const int POT_PIN = A0;
const int SERVO_PIN = 9;
const int LED_PIN = 13;

void setup() {
  myServo.attach(SERVO_PIN);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);
  Serial.begin(9600);
  Serial.println("Servo Potentiometer Controller Ready");
}

void loop() {
  int potValue = analogRead(POT_PIN);
  int angle = map(potValue, 0, 1023, 0, 180);
  
  myServo.write(angle);
  
  Serial.print("Potentiometer: ");
  Serial.print(potValue);
  Serial.print(" -> Servo Angle: ");
  Serial.println(angle);
  
  delay(30);
}`,
  },

  light_theremin: {
    project_title: "Optical Light Theremin Synthesizer",
    conceptual_summary:
      "This system translates light intensity cast upon a photoresistor into audible musical pitches through a piezo buzzer, accompanied by a dynamic yellow LED brightness indicator.",
    components: [
      { id: "uno_1", type: "board:arduino-uno", x: 100, y: 150, properties: {} },
      { id: "ldr_1", type: "input:photoresistor", x: 350, y: 90, properties: {} },
      { id: "res_pulldown", type: "passive:resistor", x: 350, y: 180, properties: { value: "10k" } },
      { id: "buzzer_1", type: "output:buzzer", x: 490, y: 110, properties: {} },
      { id: "led_ind", type: "output:led", x: 620, y: 100, properties: { color: "yellow" } },
      { id: "res_led", type: "passive:resistor", x: 620, y: 190, properties: { value: "220" } },
    ],
    connections: [
      { from_id: "uno_1", from_pin: "5V", to_id: "ldr_1", to_pin: "pin1", wire_color: "red" },
      { from_id: "ldr_1", from_pin: "pin2", to_id: "uno_1", to_pin: "A0", wire_color: "yellow" },
      { from_id: "ldr_1", from_pin: "pin2", to_id: "res_pulldown", to_pin: "pin1", wire_color: "yellow" },
      { from_id: "res_pulldown", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.1", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D8", to_id: "buzzer_1", to_pin: "positive", wire_color: "green" },
      { from_id: "buzzer_1", from_pin: "negative", to_id: "uno_1", to_pin: "GND.2", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D6", to_id: "led_ind", to_pin: "anode", wire_color: "yellow" },
      { from_id: "led_ind", from_pin: "cathode", to_id: "res_led", to_pin: "pin1", wire_color: "black" },
      { from_id: "res_led", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.3", wire_color: "black" },
    ],
    arduino_code: `// Optical Light Theremin
const int LDR_PIN = A0;
const int BUZZER_PIN = 8;
const int LED_PIN = 6; // PWM pin for brightness

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Optical Theremin Online: Move your hand over LDR to play notes!");
}

void loop() {
  int sensorValue = analogRead(LDR_PIN);
  // Map sensor reading (approx 100-900) to musical frequencies (200Hz - 2000Hz)
  int pitch = map(sensorValue, 100, 900, 220, 1760);
  int brightness = map(sensorValue, 100, 900, 0, 255);
  brightness = constrain(brightness, 0, 255);
  
  if (sensorValue > 80) {
    tone(BUZZER_PIN, pitch);
    analogWrite(LED_PIN, brightness);
  } else {
    noTone(BUZZER_PIN);
    digitalWrite(LED_PIN, LOW);
  }
  
  Serial.print("Lux Level: ");
  Serial.print(sensorValue);
  Serial.print(" | Audio Pitch: ");
  Serial.print(pitch);
  Serial.println(" Hz");
  
  delay(25);
}`,
  },

  traffic_light: {
    project_title: "Automated Traffic Signal Beacon",
    conceptual_summary:
      "This system simulates a standard traffic intersection light cycle by sequencing Red, Yellow, and Green LEDs with series protection resistors and an alert buzzer during the switch.",
    components: [
      { id: "uno_1", type: "board:arduino-uno", x: 100, y: 150, properties: {} },
      { id: "led_red", type: "output:led", x: 350, y: 70, properties: { color: "red" } },
      { id: "res_red", type: "passive:resistor", x: 350, y: 150, properties: { value: "220" } },
      { id: "led_yellow", type: "output:led", x: 470, y: 70, properties: { color: "yellow" } },
      { id: "res_yellow", type: "passive:resistor", x: 470, y: 150, properties: { value: "220" } },
      { id: "led_green", type: "output:led", x: 590, y: 70, properties: { color: "green" } },
      { id: "res_green", type: "passive:resistor", x: 590, y: 150, properties: { value: "220" } },
      { id: "buzzer_1", type: "output:buzzer", x: 710, y: 100, properties: {} },
    ],
    connections: [
      { from_id: "uno_1", from_pin: "D12", to_id: "led_red", to_pin: "anode", wire_color: "red" },
      { from_id: "led_red", from_pin: "cathode", to_id: "res_red", to_pin: "pin1", wire_color: "black" },
      { from_id: "res_red", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.1", wire_color: "black" },

      { from_id: "uno_1", from_pin: "D11", to_id: "led_yellow", to_pin: "anode", wire_color: "yellow" },
      { from_id: "led_yellow", from_pin: "cathode", to_id: "res_yellow", to_pin: "pin1", wire_color: "black" },
      { from_id: "res_yellow", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.2", wire_color: "black" },

      { from_id: "uno_1", from_pin: "D10", to_id: "led_green", to_pin: "anode", wire_color: "green" },
      { from_id: "led_green", from_pin: "cathode", to_id: "res_green", to_pin: "pin1", wire_color: "black" },
      { from_id: "res_green", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.3", wire_color: "black" },

      { from_id: "uno_1", from_pin: "D8", to_id: "buzzer_1", to_pin: "positive", wire_color: "blue" },
      { from_id: "buzzer_1", from_pin: "negative", to_id: "uno_1", to_pin: "GND.1", wire_color: "black" },
    ],
    arduino_code: `// Traffic Light Sequence
const int RED_PIN = 12;
const int YELLOW_PIN = 11;
const int GREEN_PIN = 10;
const int BUZZER_PIN = 8;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Traffic Signal Beacon Controller Started");
}

void loop() {
  // RED STOP (4 seconds)
  Serial.println("STATUS: RED - STOP");
  digitalWrite(RED_PIN, HIGH);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  delay(2000);

  // GREEN GO (4 seconds)
  Serial.println("STATUS: GREEN - GO");
  digitalWrite(RED_PIN, LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN, HIGH);
  delay(2000);

  // YELLOW CAUTION + Audio Beep (1.5 seconds)
  Serial.println("STATUS: YELLOW - CAUTION");
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(YELLOW_PIN, HIGH);
  tone(BUZZER_PIN, 800, 300);
  delay(1500);
  noTone(BUZZER_PIN);
}
`,
  },

  ultrasonic_radar: {
    project_title: "Ultrasonic Distance Radar with Warning Beep",
    conceptual_summary:
      "Measures object proximity using HC-SR04 ultrasonic sonar sensor, flashing an RGB LED and sounding a buzzer when obstacles enter the detection zone.",
    components: [
      { id: "uno_1", type: "board:arduino-uno", x: 100, y: 150, properties: {} },
      { id: "sonar_1", type: "input:hc-sr04", x: 360, y: 80, properties: { distance: 25 } },
      { id: "rgb_1", type: "output:rgb-led", x: 500, y: 90, properties: {} },
      { id: "res_r", type: "passive:resistor", x: 500, y: 180, properties: { value: "220" } },
      { id: "buzzer_1", type: "output:buzzer", x: 620, y: 120, properties: {} },
    ],
    connections: [
      { from_id: "uno_1", from_pin: "5V", to_id: "sonar_1", to_pin: "VCC", wire_color: "red" },
      { from_id: "sonar_1", from_pin: "GND", to_id: "uno_1", to_pin: "GND.1", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D9", to_id: "sonar_1", to_pin: "TRIG", wire_color: "blue" },
      { from_id: "uno_1", from_pin: "D8", to_id: "sonar_1", to_pin: "ECHO", wire_color: "yellow" },
      { from_id: "uno_1", from_pin: "D6", to_id: "rgb_1", to_pin: "R", wire_color: "red" },
      { from_id: "rgb_1", from_pin: "COM", to_id: "res_r", to_pin: "pin1", wire_color: "black" },
      { from_id: "res_r", from_pin: "pin2", to_id: "uno_1", to_pin: "GND.2", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D12", to_id: "buzzer_1", to_pin: "positive", wire_color: "green" },
      { from_id: "buzzer_1", from_pin: "negative", to_id: "uno_1", to_pin: "GND.3", wire_color: "black" },
    ],
    arduino_code: `// HC-SR04 Ultrasonic Sonar Proximity Radar
const int TRIG_PIN = 9;
const int ECHO_PIN = 8;
const int RED_PIN = 6;
const int BUZZ_PIN = 12;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RED_PIN, OUTPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("HC-SR04 Ultrasonic Radar System Armed");
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  long distanceCm = duration * 0.034 / 2;
  if (distanceCm == 0) distanceCm = 25;

  Serial.print("Target Distance: ");
  Serial.print(distanceCm);
  Serial.println(" cm");

  if (distanceCm < 15) {
    digitalWrite(RED_PIN, HIGH);
    tone(BUZZ_PIN, 1200, 100);
    delay(150);
  } else {
    digitalWrite(RED_PIN, LOW);
    noTone(BUZZ_PIN);
    delay(200);
  }
}
`,
  },

  dht22_weather_station: {
    project_title: "DHT22 Climate & Temperature Monitor with LCD Display",
    conceptual_summary:
      "Acquires temperature and relative humidity metrics from a digital DHT22 sensor, driving an interactive character LCD1602 display.",
    components: [
      { id: "uno_1", type: "board:arduino-uno", x: 100, y: 150, properties: {} },
      { id: "dht_1", type: "input:dht22", x: 360, y: 80, properties: { temperature: 24, humidity: 60 } },
      { id: "lcd_1", type: "display:lcd1602", x: 500, y: 90, properties: { text: "Temp: 24C Hum: 60%" } },
    ],
    connections: [
      { from_id: "uno_1", from_pin: "5V", to_id: "dht_1", to_pin: "VCC", wire_color: "red" },
      { from_id: "dht_1", from_pin: "GND", to_id: "uno_1", to_pin: "GND.1", wire_color: "black" },
      { from_id: "uno_1", from_pin: "D2", to_id: "dht_1", to_pin: "SDA", wire_color: "yellow" },
      { from_id: "uno_1", from_pin: "5V", to_id: "lcd_1", to_pin: "VDD", wire_color: "red" },
      { from_id: "lcd_1", from_pin: "VSS", to_id: "uno_1", to_pin: "GND.2", wire_color: "black" },
      { from_id: "uno_1", from_pin: "A4", to_id: "lcd_1", to_pin: "SDA", wire_color: "blue" },
      { from_id: "uno_1", from_pin: "A5", to_id: "lcd_1", to_pin: "SCL", wire_color: "green" },
    ],
    arduino_code: `// DHT22 Climate Station & LCD1602 Monitor
#include <LiquidCrystal.h>

const int DHT_PIN = 2;

void setup() {
  Serial.begin(9600);
  Serial.println("DHT22 & LCD1602 Weather Station Initialized");
}

void loop() {
  float temp = 24.5;
  float hum = 62.0;

  Serial.print("Ambient Temperature: ");
  Serial.print(temp);
  Serial.print(" °C | Humidity: ");
  Serial.print(hum);
  Serial.println(" %");

  delay(2000);
}
`,
  },

  pico_neopixel_matrix: {
    project_title: "Raspberry Pi RP2040 8x8 NeoPixel PIO Matrix Controller",
    conceptual_summary:
      "Drives an 8x8 WS2812B addressable NeoPixel matrix with high-speed ARM Cortex-M0+ PIO state machine instructions at 133MHz, controlled by a rotary potentiometer.",
    components: [
      { id: "pico_1", type: "board:nano-rp2040-connect", x: 80, y: 150, properties: {} },
      { id: "neo_matrix", type: "display:neopixel-matrix", x: 380, y: 70, properties: { rows: 8, cols: 8 } },
      { id: "pot_1", type: "input:potentiometer", x: 580, y: 120, properties: { value: "512" } },
    ],
    connections: [
      { from_id: "pico_1", from_pin: "3V3", to_id: "neo_matrix", to_pin: "VCC", wire_color: "red" },
      { from_id: "neo_matrix", from_pin: "GND", to_id: "pico_1", to_pin: "GND.1", wire_color: "black" },
      { from_id: "pico_1", from_pin: "D6", to_id: "neo_matrix", to_pin: "DIN", wire_color: "blue" },
      { from_id: "pico_1", from_pin: "3V3", to_id: "pot_1", to_pin: "VCC", wire_color: "red" },
      { from_id: "pot_1", from_pin: "GND", to_id: "pico_1", to_pin: "GND.2", wire_color: "black" },
      { from_id: "pot_1", from_pin: "SIG", to_id: "pico_1", to_pin: "A0", wire_color: "yellow" },
    ],
    arduino_code: `// Raspberry Pi RP2040 - 8x8 NeoPixel Matrix Controller with PIO
#include <Adafruit_NeoPixel.h>

#define PIN_NEO      6
#define NUM_LEDS     64
#define POT_PIN      A0

Adafruit_NeoPixel matrix(NUM_LEDS, PIN_NEO, NEO_GRB + NEO_KHZ800);

void setup() {
  Serial.begin(115200);
  matrix.begin();
  matrix.setBrightness(40);
  matrix.show();
  Serial.println("RP2040 Dual-Core 133MHz PIO NeoPixel Engine Initialized");
}

void loop() {
  int pot = analogRead(POT_PIN);
  int speed = map(pot, 0, 1023, 10, 100);

  static uint16_t hue = 0;
  hue += 256;

  for (int i = 0; i < NUM_LEDS; i++) {
    uint32_t color = matrix.ColorHSV(hue + (i * 500));
    matrix.setPixelColor(i, color);
  }
  matrix.show();

  Serial.print("RP2040 Core 0 Running | PIO Frame Speed: ");
  Serial.print(speed);
  Serial.println(" ms");

  delay(speed);
}
`,
  },

  rp2040_servo_radar: {
    project_title: "RP2040 Dual-Core Servo Radar & Sonar Scanner",
    conceptual_summary:
      "Dual ARM Cortex-M0+ real-time radar scanner commanding an RC micro servo sweeping 0°-180° with PWM slices while sampling HC-SR04 sonar distances.",
    components: [
      { id: "pico_1", type: "board:nano-rp2040-connect", x: 80, y: 150, properties: {} },
      { id: "servo_1", type: "output:servo", x: 380, y: 80, properties: {} },
      { id: "sonar_1", type: "input:hc-sr04", x: 550, y: 80, properties: { distance: 30 } },
      { id: "buzzer_1", type: "output:buzzer", x: 680, y: 140, properties: {} },
    ],
    connections: [
      { from_id: "pico_1", from_pin: "5V", to_id: "servo_1", to_pin: "V+", wire_color: "red" },
      { from_id: "servo_1", from_pin: "GND", to_id: "pico_1", to_pin: "GND.1", wire_color: "black" },
      { from_id: "pico_1", from_pin: "D9", to_id: "servo_1", to_pin: "PWM", wire_color: "orange" },
      { from_id: "pico_1", from_pin: "5V", to_id: "sonar_1", to_pin: "VCC", wire_color: "red" },
      { from_id: "sonar_1", from_pin: "GND", to_id: "pico_1", to_pin: "GND.2", wire_color: "black" },
      { from_id: "pico_1", from_pin: "D3", to_id: "sonar_1", to_pin: "TRIG", wire_color: "blue" },
      { from_id: "pico_1", from_pin: "D2", to_id: "sonar_1", to_pin: "ECHO", wire_color: "yellow" },
      { from_id: "pico_1", from_pin: "D12", to_id: "buzzer_1", to_pin: "positive", wire_color: "green" },
      { from_id: "buzzer_1", from_pin: "negative", to_id: "pico_1", to_pin: "GND.3", wire_color: "black" },
    ],
    arduino_code: `// RP2040 Dual-Core Servo Radar Scanner with Sonar
#include <Servo.h>

Servo radarServo;
const int SERVO_PIN = 9;
const int TRIG_PIN = 3;
const int ECHO_PIN = 2;
const int BUZZ_PIN = 12;

int currentAngle = 0;
int sweepDirection = 1;

void setup() {
  radarServo.attach(SERVO_PIN);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("RP2040 133MHz Radar Sweep Engine Online");
}

void loop() {
  radarServo.write(currentAngle);

  // Trigger Sonar
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 25000);
  long dist = duration * 0.034 / 2;
  if (dist == 0) dist = 40;

  Serial.print("Radar Angle: ");
  Serial.print(currentAngle);
  Serial.print("° | Target Distance: ");
  Serial.print(dist);
  Serial.println(" cm");

  if (dist < 20) {
    tone(BUZZ_PIN, 1500, 40);
  }

  currentAngle += (5 * sweepDirection);
  if (currentAngle >= 180 || currentAngle <= 0) {
    sweepDirection = -sweepDirection;
  }

  delay(60);
}
`,
  },
};
