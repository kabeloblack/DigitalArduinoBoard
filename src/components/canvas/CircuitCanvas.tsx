import React, { useState, useRef, useEffect } from "react";
import {
  CircuitBlueprint,
  CircuitComponent,
  CircuitConnection,
  SimulationState,
  WireColor,
} from "../../types/circuit";
import { ArduinoUno } from "./ArduinoUno";
import { LedComponent } from "./LedComponent";
import { BuzzerComponent } from "./BuzzerComponent";
import { ServoComponent } from "./ServoComponent";
import { PhotoresistorComponent } from "./PhotoresistorComponent";
import { PotentiometerComponent } from "./PotentiometerComponent";
import { ResistorComponent } from "./ResistorComponent";
import { DcMotorComponent } from "./DcMotorComponent";
import { BreadboardComponent } from "./BreadboardComponent";
import { CameraComponent } from "./CameraComponent";
import { BatteryComponent } from "./BatteryComponent";
import { CapacitorComponent } from "./CapacitorComponent";
import { DiodeComponent } from "./DiodeComponent";
import { TransistorComponent } from "./TransistorComponent";
import { SpeakerComponent } from "./SpeakerComponent";
import { GenericWokwiComponent } from "./GenericWokwiComponent";
import { getWokwiItem } from "../../services/wokwiCatalog";
import { WireOverlay, getComponentPinCoord } from "./WireOverlay";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  X,
  Zap,
  Layers,
  Sparkles,
  Palette,
  Check,
  Lightbulb,
  Sliders,
} from "lucide-react";

interface CircuitCanvasProps {
  blueprint: CircuitBlueprint;
  simState: SimulationState;
  onUpdateBlueprint: (blueprint: CircuitBlueprint) => void;
  onSensorChange: (componentId: string, valueKey: "lightLevel" | "potValue", value: number) => void;
  onDigitalInput: (componentId: string, pressed: boolean) => void;
}

const WIRE_COLORS: Array<{ name: WireColor; bg: string; border: string }> = [
  { name: "red", bg: "bg-red-500", border: "border-red-400" },
  { name: "black", bg: "bg-slate-900", border: "border-slate-600" },
  { name: "yellow", bg: "bg-yellow-400", border: "border-yellow-300" },
  { name: "green", bg: "bg-emerald-500", border: "border-emerald-400" },
  { name: "blue", bg: "bg-blue-500", border: "border-blue-400" },
  { name: "white", bg: "bg-slate-100", border: "border-slate-300" },
];

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  blueprint,
  simState,
  onUpdateBlueprint,
  onSensorChange,
  onDigitalInput,
}) => {
  const ldrComp = blueprint.components.find((c) => c.type === "input:photoresistor");
  const potComp = blueprint.components.find((c) => c.type === "input:potentiometer");
  const buttonComps = blueprint.components.filter(
    (c) => c.type === "input:pushbutton" || c.type === "input:pushbutton-6mm"
  );

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{ compId: string; pinId: string } | null>(null);
  const [hoveredWire, setHoveredWire] = useState<number | null>(null);

  // Active wiring state (Pin A -> Pin B)
  const [wiringFrom, setWiringFrom] = useState<{ compId: string; pinId: string } | null>(null);
  const [mouseSvgPos, setMouseSvgPos] = useState({ x: 0, y: 0 });
  const [selectedWireColor, setSelectedWireColor] = useState<WireColor>("yellow");
  const [wiringNotice, setWiringNotice] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Cancel wiring on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (wiringFrom) {
          setWiringFrom(null);
          setWiringNotice(null);
        } else if (selectedCompId) {
          setSelectedCompId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wiringFrom, selectedCompId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on canvas background, start pan and deselect
    const target = e.target as HTMLElement;
    if (
      target === containerRef.current ||
      target.tagName === "svg" ||
      target.id === "grid-bg" ||
      target.id === "grid-pattern-rect"
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedCompId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const svgRect = containerRef.current?.getBoundingClientRect();
    if (svgRect) {
      const mouseSvgX = (e.clientX - svgRect.left - pan.x) / zoom;
      const mouseSvgY = (e.clientY - svgRect.top - pan.y) / zoom;
      setMouseSvgPos({ x: Math.round(mouseSvgX), y: Math.round(mouseSvgY) });

      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggingCompId) {
        const updatedComponents = blueprint.components.map((c) => {
          if (c.id === draggingCompId) {
            return {
              ...c,
              x: Math.round(mouseSvgX - dragOffset.x),
              y: Math.round(mouseSvgY - dragOffset.y),
            };
          }
          return c;
        });

        onUpdateBlueprint({
          ...blueprint,
          components: updatedComponents,
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCompId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  const startDragComponent = (compId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCompId(compId);
    const comp = blueprint.components.find((c) => c.id === compId);
    if (!comp) return;

    const svgRect = containerRef.current?.getBoundingClientRect();
    if (svgRect) {
      const mouseSvgX = (e.clientX - svgRect.left - pan.x) / zoom;
      const mouseSvgY = (e.clientY - svgRect.top - pan.y) / zoom;
      setDraggingCompId(compId);
      setDragOffset({
        x: mouseSvgX - comp.x,
        y: mouseSvgY - comp.y,
      });
    }
  };

  // Handle Pin Clicks for Manual Wiring / Plugging
  const handlePinClick = (compId: string, pinId: string) => {
    if (!wiringFrom) {
      // Step 1: Set origin pin
      setWiringFrom({ compId, pinId });
      setWiringNotice(`Plugged into ${compId}:${pinId}. Click target pin on another part to connect.`);
    } else {
      // Step 2: Set destination pin & create connection
      if (wiringFrom.compId === compId && wiringFrom.pinId === pinId) {
        // Clicked same pin -> Cancel
        setWiringFrom(null);
        setWiringNotice(null);
        return;
      }

      // Determine smart auto color based on pin names
      let colorToUse: WireColor = selectedWireColor;
      const p1 = wiringFrom.pinId.toLowerCase();
      const p2 = pinId.toLowerCase();

      if (p1.includes("gnd") || p2.includes("gnd") || p1.includes("cathode") || p2.includes("cathode") || p1.includes("neg") || p2.includes("neg")) {
        colorToUse = "black";
      } else if (p1.includes("5v") || p2.includes("5v") || p1.includes("3.3v") || p2.includes("3.3v") || p1.includes("vcc") || p2.includes("vcc") || p1.includes("pos") || p2.includes("pos")) {
        colorToUse = "red";
      } else if (p1.startsWith("a") || p2.startsWith("a") || p1.includes("wiper") || p2.includes("wiper")) {
        colorToUse = "yellow";
      } else if (p1.startsWith("d") || p2.startsWith("d") || p1.includes("pwm") || p2.includes("pwm")) {
        colorToUse = "blue";
      }

      const newConnection: CircuitConnection = {
        from_id: wiringFrom.compId,
        from_pin: wiringFrom.pinId,
        to_id: compId,
        to_pin: pinId,
        wire_color: colorToUse,
      };

      // Check if duplicate connection already exists
      const isDuplicate = blueprint.connections.some(
        (c) =>
          (c.from_id === newConnection.from_id &&
            c.from_pin === newConnection.from_pin &&
            c.to_id === newConnection.to_id &&
            c.to_pin === newConnection.to_pin) ||
          (c.from_id === newConnection.to_id &&
            c.from_pin === newConnection.to_pin &&
            c.to_id === newConnection.from_id &&
            c.to_pin === newConnection.from_pin)
      );

      if (!isDuplicate) {
        onUpdateBlueprint({
          ...blueprint,
          connections: [...blueprint.connections, newConnection],
        });
        setWiringNotice(`Connected ${wiringFrom.compId}:${wiringFrom.pinId} → ${compId}:${pinId}`);
        setTimeout(() => setWiringNotice(null), 3000);
      } else {
        setWiringNotice("Connection already exists.");
        setTimeout(() => setWiringNotice(null), 2500);
      }

      setWiringFrom(null);
    }
  };

  // Delete a wire
  const handleDeleteWire = (index: number) => {
    const updated = blueprint.connections.filter((_, i) => i !== index);
    onUpdateBlueprint({
      ...blueprint,
      connections: updated,
    });
    setHoveredWire(null);
  };

  // Delete selected component
  const handleDeleteSelectedComponent = () => {
    if (!selectedCompId) return;
    const updatedComps = blueprint.components.filter((c) => c.id !== selectedCompId);
    const updatedConns = blueprint.connections.filter(
      (c) => c.from_id !== selectedCompId && c.to_id !== selectedCompId
    );
    onUpdateBlueprint({
      ...blueprint,
      components: updatedComps,
      connections: updatedConns,
    });
    setSelectedCompId(null);
  };

  const handleUpdateComponentProperties = (componentId: string, props: Record<string, any>) => {
    onUpdateBlueprint({
      ...blueprint,
      components: blueprint.components.map((c) => (c.id === componentId ? { ...c, properties: props } : c)),
    });
  };

  // Handle Drag & Drop of new components from tray
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (!data.type) return;

      const svgRect = containerRef.current?.getBoundingClientRect();
      if (svgRect) {
        const dropX = Math.round((e.clientX - svgRect.left - pan.x) / zoom);
        const dropY = Math.round((e.clientY - svgRect.top - pan.y) / zoom);

        // Generate clean unique ID
        const prefix = data.type.split(":")[1]?.replace(/[^a-z0-9]/gi, "_") || "comp";
        let counter = 1;
        while (blueprint.components.some((c) => c.id === `${prefix}_${counter}`)) {
          counter++;
        }
        const newId = `${prefix}_${counter}`;

        const newComponent: CircuitComponent = {
          id: newId,
          type: data.type,
          x: dropX,
          y: dropY,
          properties: data.properties || {},
        };

        onUpdateBlueprint({
          ...blueprint,
          components: [...blueprint.components, newComponent],
        });
        setSelectedCompId(newId);
      }
    } catch {
      // Ignore invalid drag payload
    }
  };

  // Calculate coordinates for in-progress wire
  let inProgressWireData = null;
  if (wiringFrom) {
    const startComp = blueprint.components.find((c) => c.id === wiringFrom.compId);
    if (startComp) {
      const startCoord = getComponentPinCoord(startComp, wiringFrom.pinId);
      if (startCoord) {
        inProgressWireData = {
          startX: startCoord.x,
          startY: startCoord.y,
          currentX: mouseSvgPos.x,
          currentY: mouseSvgPos.y,
          color: selectedWireColor,
        };
      }
    }
  }

  const selectedComponent = blueprint.components.find((c) => c.id === selectedCompId);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-full h-[580px] bg-[#020617] overflow-hidden border border-slate-700/80 rounded-xl select-none shadow-2xl"
    >
      {/* Top Left Canvas Toolbar: Zoom, Reset, Wire Color Picker */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 glass-panel-strong px-3 py-1.5 rounded-lg">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z * 1.15))}
          title="Zoom In"
          className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z * 0.85))}
          title="Zoom Out"
          className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 20, y: 30 });
          }}
          title="Reset View"
          className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>

        {/* Wire Color Palette */}
        <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />
        <div className="flex items-center gap-1" title="Select Wire Color for Manual Plugging">
          <Palette className="w-3 h-3 text-slate-400 mr-0.5" />
          {WIRE_COLORS.map((wc) => (
            <button
              key={wc.name}
              type="button"
              onClick={() => setSelectedWireColor(wc.name)}
              className={`w-3.5 h-3.5 rounded-full ${wc.bg} ${wc.border} border transition cursor-pointer flex items-center justify-center ${
                selectedWireColor === wc.name ? "ring-2 ring-blue-400 scale-110" : "opacity-80 hover:opacity-100"
              }`}
              title={`Wire Color: ${wc.name}`}
            />
          ))}
        </div>
      </div>

      {/* Top Right: Live Simulation Status Badge + Interactive Hardware Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 glass-panel-strong px-3 py-1.5 rounded-lg">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simState.isRunning ? "bg-emerald-400 animate-pulse ring-4 ring-emerald-950" : "bg-slate-500"
            }`}
          />
          <span className="text-[11px] font-semibold tracking-wider font-mono text-slate-200 uppercase">
            {simState.isRunning ? "SIMULATION ACTIVE" : "SIMULATOR STANDBY"}
          </span>
        </div>

        {(ldrComp || potComp || buttonComps.length > 0) && (
          <div className="flex flex-col items-end gap-1.5 glass-panel-strong px-3 py-2 rounded-lg max-w-[260px]">
            <div className="flex items-center gap-1.5 text-slate-400 self-start">
              <Sliders className="w-3 h-3" />
              <span className="text-[9px] font-mono uppercase tracking-wider">Interactive Controls</span>
            </div>

            {ldrComp && (
              <div className="flex items-center gap-2 glass-well px-2.5 py-1 rounded-lg w-full">
                <span className="text-amber-300 text-[10px] font-mono font-semibold shrink-0">LDR</span>
                <input
                  type="range"
                  min="0"
                  max="1023"
                  value={simState.componentStates[ldrComp.id]?.lightLevel ?? 450}
                  onChange={(e) => onSensorChange(ldrComp.id, "lightLevel", Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 accent-amber-400 rounded cursor-pointer"
                  title="Dark <-> Bright"
                />
                <span className="text-amber-400 font-mono font-bold text-[10px] w-8 text-right shrink-0">
                  {Math.round(simState.componentStates[ldrComp.id]?.lightLevel ?? 450)}
                </span>
              </div>
            )}

            {potComp && (
              <div className="flex items-center gap-2 glass-well px-2.5 py-1 rounded-lg w-full">
                <span className="text-sky-300 text-[10px] font-mono font-semibold shrink-0">POT</span>
                <input
                  type="range"
                  min="0"
                  max="1023"
                  value={simState.componentStates[potComp.id]?.potValue ?? 512}
                  onChange={(e) => onSensorChange(potComp.id, "potValue", Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 accent-blue-500 rounded cursor-pointer"
                  title="0° <-> 300°"
                />
                <span className="text-sky-400 font-mono font-bold text-[10px] w-8 text-right shrink-0">
                  {Math.round(simState.componentStates[potComp.id]?.potValue ?? 512)}
                </span>
              </div>
            )}

            {buttonComps.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 justify-end w-full">
                {buttonComps.map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onMouseDown={() => onDigitalInput(btn.id, true)}
                    onMouseUp={() => onDigitalInput(btn.id, false)}
                    onMouseLeave={() => onDigitalInput(btn.id, false)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      onDigitalInput(btn.id, true);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      onDigitalInput(btn.id, false);
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition cursor-pointer select-none ${
                      simState.componentStates[btn.id]?.isPressed
                        ? "glass-btn-primary bg-emerald-600 text-white"
                        : "glass-well text-emerald-300 hover:border-emerald-600"
                    }`}
                    title="Press and hold to simulate a button press (INPUT_PULLUP: idle HIGH, pressed LOW)"
                  >
                    {btn.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wiring In-Progress / Notification Toast Banner */}
      {wiringFrom && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 glass-panel-strong ring-1 ring-blue-500/50 text-blue-100 px-4 py-2 rounded-lg text-xs font-mono animate-bounce">
          <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>
            Wiring Mode: Click destination pin on another part (Press <strong>ESC</strong> to cancel)
          </span>
          <button
            onClick={() => {
              setWiringFrom(null);
              setWiringNotice(null);
            }}
            className="p-1 hover:bg-blue-800 rounded text-blue-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {wiringNotice && !wiringFrom && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 glass-panel-strong ring-1 ring-emerald-500/50 text-emerald-200 px-3.5 py-1.5 rounded-lg text-xs font-mono">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{wiringNotice}</span>
        </div>
      )}

      {/* Selected Component Floating Control Bar */}
      {selectedComponent && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2.5 glass-panel-strong ring-1 ring-blue-500/40 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-bold text-blue-300">{selectedComponent.id}</span>
            <span className="text-slate-400 text-[11px]">({selectedComponent.type})</span>
          </div>

          <div className="w-[1px] h-3.5 bg-slate-700" />

          <button
            onClick={handleDeleteSelectedComponent}
            className="glass-btn-primary flex items-center gap-1 px-2 py-0.5 bg-red-900/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-700/60 rounded text-[11px] font-semibold transition cursor-pointer"
            title="Delete selected component and its wires"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}

      {/* Interactive Helper Banner */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-1.5 glass-panel-strong px-2.5 py-1 rounded text-[11px] font-mono text-slate-400">
        <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Click pin to plug wire • Drag parts from bottom tray • Scroll to zoom</span>
      </div>

      {/* SVG Circuit Canvas Viewport */}
      <svg className="w-full h-full cursor-grab active:cursor-grabbing">
        <defs>
          <pattern id="circuit-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="#334155" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect id="grid-bg" width="100%" height="100%" fill="#090d16" />
        <rect id="grid-pattern-rect" width="100%" height="100%" fill="url(#circuit-grid)" />

        {/* Transformed Stage */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Wire Jumper Layer */}
          <WireOverlay
            components={blueprint.components}
            connections={blueprint.connections}
            hoveredWireIndex={hoveredWire}
            onWireHover={setHoveredWire}
            onDeleteWire={handleDeleteWire}
            inProgressWire={inProgressWireData}
          />

          {/* Render All Components (breadboards render first/behind so parts visually sit on top of them) */}
          {[...blueprint.components]
            .sort((a, b) => (a.type === "tool:breadboard" ? -1 : 0) - (b.type === "tool:breadboard" ? -1 : 0))
            .map((comp) => {
            const compState = simState.componentStates[comp.id] || {};
            const isSelected = selectedCompId === comp.id;
            const itemDef = getWokwiItem(comp.type, comp.properties);
            const boxWidth = itemDef ? itemDef.width + 16 : (comp.type === "board:arduino-uno" ? 226 : 64);
            const boxHeight = itemDef ? itemDef.height + 16 : (comp.type === "board:arduino-uno" ? 156 : 74);

            return (
              <g
                key={comp.id}
                onMouseDown={(e) => startDragComponent(comp.id, e)}
                className="cursor-move group"
              >
                {/* Selection Outline Box */}
                {isSelected && (
                  <rect
                    x={comp.x - 8}
                    y={comp.y - 8}
                    width={boxWidth}
                    height={boxHeight}
                    rx="8"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-pulse pointer-events-none"
                  />
                )}

                {comp.type === "board:arduino-uno" && (
                  <ArduinoUno
                    x={comp.x}
                    y={comp.y}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    activePins={simState.digitalPins}
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "output:led" && (
                  <LedComponent
                    id={comp.id}
                    x={comp.x}
                    y={comp.y}
                    color={comp.properties?.color || "red"}
                    isOn={compState.isOn}
                    brightness={compState.brightness}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "output:buzzer" && (
                  <BuzzerComponent
                    id={comp.id}
                    x={comp.x}
                    y={comp.y}
                    isBuzzing={compState.isBuzzing}
                    frequency={compState.frequency}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "output:servo" && (
                  <ServoComponent
                    id={comp.id}
                    x={comp.x}
                    y={comp.y}
                    angle={compState.servoAngle ?? 90}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "input:photoresistor" && (
                  <PhotoresistorComponent
                    id={comp.id}
                    x={comp.x}
                    y={comp.y}
                    lightLevel={compState.lightLevel ?? 450}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                    onLightChange={(val) => onSensorChange(comp.id, "lightLevel", val)}
                  />
                )}

                {comp.type === "input:potentiometer" && (
                  <PotentiometerComponent
                    id={comp.id}
                    x={comp.x}
                    y={comp.y}
                    value={compState.potValue ?? 512}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                    onValueChange={(val) => onSensorChange(comp.id, "potValue", val)}
                  />
                )}

                {comp.type === "passive:resistor" && (
                  <ResistorComponent
                    id={comp.id}
                    x={comp.x}
                    y={comp.y}
                    value={comp.properties?.value || "220"}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "output:dc-motor" && (
                  <DcMotorComponent
                    id={comp.id}
                    x={comp.x}
                    y={comp.y}
                    speed={compState.motorSpeed ?? 0}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "tool:breadboard" && (
                  <BreadboardComponent
                    component={comp}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {(comp.type === "input:camera-arducam" || comp.type === "input:camera-ov7670") && (
                  <CameraComponent
                    component={comp}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                    onUpdateProperties={handleUpdateComponentProperties}
                  />
                )}

                {comp.type === "power:battery-9v" && (
                  <BatteryComponent
                    component={comp}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {(comp.type === "passive:capacitor-ceramic" || comp.type === "passive:capacitor-electrolytic") && (
                  <CapacitorComponent
                    component={comp}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "passive:diode" && (
                  <DiodeComponent
                    component={comp}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "passive:transistor-npn" && (
                  <TransistorComponent
                    component={comp}
                    isConducting={compState.isConducting}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {comp.type === "output:speaker" && (
                  <SpeakerComponent
                    component={comp}
                    isBuzzing={compState.isBuzzing}
                    highlightedPin={
                      hoveredPin?.compId === comp.id
                        ? hoveredPin.pinId
                        : wiringFrom?.compId === comp.id
                        ? wiringFrom.pinId
                        : null
                    }
                    onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                    onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                  />
                )}

                {/* Render any of the other 40+ Wokwi web-component-backed parts */}
                {comp.type !== "board:arduino-uno" &&
                  comp.type !== "output:led" &&
                  comp.type !== "output:buzzer" &&
                  comp.type !== "output:servo" &&
                  comp.type !== "input:photoresistor" &&
                  comp.type !== "input:potentiometer" &&
                  comp.type !== "passive:resistor" &&
                  comp.type !== "output:dc-motor" &&
                  comp.type !== "tool:breadboard" &&
                  comp.type !== "input:camera-arducam" &&
                  comp.type !== "input:camera-ov7670" &&
                  comp.type !== "power:battery-9v" &&
                  comp.type !== "passive:capacitor-ceramic" &&
                  comp.type !== "passive:capacitor-electrolytic" &&
                  comp.type !== "passive:diode" &&
                  comp.type !== "passive:transistor-npn" &&
                  comp.type !== "output:speaker" && (
                    <GenericWokwiComponent
                      component={comp}
                      highlightedPin={
                        hoveredPin?.compId === comp.id
                          ? hoveredPin.pinId
                          : wiringFrom?.compId === comp.id
                          ? wiringFrom.pinId
                          : null
                      }
                      onPinHover={(pinId) => setHoveredPin(pinId ? { compId: comp.id, pinId } : null)}
                      onPinClick={(pinId) => handlePinClick(comp.id, pinId)}
                      liveState={compState}
                    />
                  )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
