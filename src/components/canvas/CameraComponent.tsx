import React, { useEffect, useRef, useState } from "react";
import { CircuitComponent, PinDefinition } from "../../types/circuit";
import { getWokwiItem } from "../../services/wokwiCatalog";
import { Camera, VideoOff, RefreshCw } from "lucide-react";

interface CameraComponentProps {
  component: CircuitComponent;
  highlightedPin?: string | null;
  onPinHover: (pinId: string | null) => void;
  onPinClick: (pinId: string) => void;
  onUpdateProperties: (componentId: string, props: Record<string, any>) => void;
}

/**
 * Hand-drawn camera module (no @wokwi/elements custom element exists for one). Connects
 * to a real webcam via getUserMedia and renders the live feed directly on the canvas -
 * this is a genuine live video connection, not a placeholder. It does not emulate the
 * SPI/parallel-bus register protocol real camera firmware (ArduCam/OV7670 libraries)
 * would speak, so compiled sketches can't programmatically read frame data from it; it's
 * a real webcam viewfinder wired into the circuit, not a byte-accurate hardware model.
 */
export const CameraComponent: React.FC<CameraComponentProps> = ({
  component,
  highlightedPin,
  onPinHover,
  onPinClick,
  onUpdateProperties,
}) => {
  const item = getWokwiItem(component.type, component.properties);
  const width = item?.width ?? 100;
  const height = item?.height ?? 90;
  const pins: PinDefinition[] = item?.pins ?? [];

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const savedDeviceId: string | undefined = component.properties?.webcamDeviceId;

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setConnected(false);
  };

  // Always release the camera when this component is removed/unmounted.
  useEffect(() => stopStream, []);

  const connect = async (deviceId?: string) => {
    setConnecting(true);
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stopStream();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setConnected(true);

      // Populate the device picker (labels are only available after permission is granted).
      const list = await navigator.mediaDevices.enumerateDevices();
      const cams = list.filter((d) => d.kind === "videoinput");
      setDevices(cams);

      const activeTrackSettings = stream.getVideoTracks()[0]?.getSettings();
      const activeId = deviceId ?? activeTrackSettings?.deviceId;
      if (activeId && activeId !== savedDeviceId) {
        onUpdateProperties(component.id, { ...component.properties, webcamDeviceId: activeId });
      }
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError"
          ? "Camera access denied"
          : err?.name === "NotFoundError"
          ? "No camera found"
          : err?.message || "Failed to access camera";
      setError(msg);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const pinColor = (pin: PinDefinition) => {
    if (pin.type === "power") return "#ef4444";
    if (pin.type === "ground") return "#334155";
    return "#fbbf24";
  };

  return (
    <g transform={`translate(${component.x}, ${component.y})`} className="select-none">
      <text
        x={width / 2}
        y={-8}
        fill="#94a3b8"
        fontSize="10"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="middle"
        className="pointer-events-none select-none"
      >
        {component.id}
      </text>

      {/* PCB body */}
      <rect x={0} y={0} width={width} height={height} rx={5} fill="#1e293b" stroke="#475569" strokeWidth={1} />

      {/* Lens housing */}
      <circle
        cx={width / 2}
        cy={height / 2 - 4}
        r={Math.min(width, height) / 2 - 8}
        fill="#0f172a"
        stroke="#64748b"
        strokeWidth={1.5}
      />

      {/* Live video feed, clipped to the lens circle */}
      <foreignObject
        x={width / 2 - (Math.min(width, height) / 2 - 10)}
        y={height / 2 - 4 - (Math.min(width, height) / 2 - 10)}
        width={(Math.min(width, height) / 2 - 10) * 2}
        height={(Math.min(width, height) / 2 - 10) * 2}
        style={{ overflow: "hidden", borderRadius: "9999px" }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "9999px",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            pointerEvents: connected ? "auto" : "none",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: connected ? "block" : "none",
              transform: "scaleX(-1)",
            }}
          />

          {!connected && (
            <div className="flex flex-col items-center justify-center gap-1 pointer-events-auto">
              {error ? (
                <VideoOff className="w-4 h-4 text-red-400" />
              ) : connecting ? (
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-slate-400" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  connect(savedDeviceId);
                }}
                disabled={connecting}
                className="glass-btn px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-200 cursor-pointer"
                style={{ pointerEvents: "auto" }}
              >
                {connecting ? "Connecting..." : error ? "Retry" : "Connect"}
              </button>
              {error && <span className="text-[6.5px] text-red-400 font-mono px-1 text-center">{error}</span>}
            </div>
          )}

          {connected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker((s) => !s);
              }}
              className="absolute bottom-0 left-0 right-0 text-[7px] font-mono text-white bg-black/50 hover:bg-black/70 py-0.5 text-center"
              style={{ pointerEvents: "auto" }}
            >
              ⚙
            </button>
          )}
        </div>
      </foreignObject>

      {/* Device picker / disconnect popover */}
      {connected && showPicker && (
        <foreignObject x={-10} y={height + 6} width={Math.max(width + 20, 150)} height={80}>
          <div className="glass-panel-strong rounded-lg p-1.5 flex flex-col gap-1" style={{ pointerEvents: "auto" }}>
            {devices.length > 1 && (
              <select
                value={savedDeviceId ?? ""}
                onChange={(e) => connect(e.target.value)}
                className="text-[8px] font-mono bg-slate-900 text-slate-200 rounded px-1 py-0.5 border border-slate-700"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || "Camera"}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => {
                stopStream();
                setShowPicker(false);
              }}
              className="text-[8px] font-mono text-red-300 hover:text-red-200 px-1 py-0.5"
            >
              Disconnect
            </button>
          </div>
        </foreignObject>
      )}

      {/* Pin hotspots */}
      {pins.map((pin) => {
        const isHighlighted = highlightedPin === pin.id || highlightedPin?.toLowerCase() === pin.label.toLowerCase();
        return (
          <g
            key={pin.id}
            transform={`translate(${pin.offsetX}, ${pin.offsetY})`}
            onMouseEnter={() => onPinHover(pin.id)}
            onMouseLeave={() => onPinHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(pin.id);
            }}
            className="cursor-pointer group/pin"
          >
            <circle cx={0} cy={0} r={7} fill="transparent" />
            <circle
              cx={0}
              cy={0}
              r={isHighlighted ? 3.5 : 2}
              fill={isHighlighted ? "#38bdf8" : pinColor(pin)}
              stroke={isHighlighted ? "#ffffff" : "#0f172a"}
              strokeWidth={isHighlighted ? 1.2 : 0.6}
            />
            {isHighlighted && (
              <g transform="translate(0, -10)" className="pointer-events-none">
                <rect x={-pin.label.length * 3 - 4} y={-9} width={pin.label.length * 6 + 8} height={12} rx={2} fill="#0f172a" stroke="#38bdf8" strokeWidth={1} />
                <text x={0} y={0} fill="#f8fafc" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {pin.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
