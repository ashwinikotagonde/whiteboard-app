// frontend/src/components/Whiteboard/Whiteboard.tsx
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line } from "react-konva";
import Toolbar from "./Toolbar";
import useUndoRedo from "./useUndoRedo";
import type { Stroke } from "./useUndoRedo";
import { connectSocket, getSocket, disconnectSocket } from "../api/socket";
import jsPDF from "jspdf";

// Konva Stage type (to avoid ANY)
import type Konva from "konva";

type Props = { sessionId: string };

const genId = () => Math.random().toString(36).slice(2, 9);

export default function Whiteboard({ sessionId }: Props) {
  
  // FIXED TYPE: NO ANY
  const stageRef = useRef<Konva.Stage | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  const {
    strokes,
    addStrokeLocal,
    addRemoteStroke,
    removeStrokeById,
    undoLocal,
    redoLocal,
    clearAll,
    canUndo,
    canRedo,
  } = useUndoRedo();

  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  // ---------------- SOCKET SETUP ----------------
  useEffect(() => {
    if (!sessionId) return;

    const socket = connectSocket(sessionId);
    socket.emit("join-session", sessionId);

    socket.on("session-data", (existing: Stroke[]) => {
      clearAll();
      existing.forEach((s) => addRemoteStroke(s));
    });

    socket.on("drawing-action", ({ stroke }: { stroke: Stroke }) => {
      addRemoteStroke(stroke);
    });

    socket.on("remove-stroke", ({ strokeId }: { strokeId: string }) => {
      removeStrokeById(strokeId);
    });

    socket.on("clear-session", () => clearAll());

    return () => {
      socket.off("session-data");
      socket.off("drawing-action");
      socket.off("remove-stroke");
      socket.off("clear-session");
      disconnectSocket();
    };
  }, [sessionId]);

  // ---------------- DRAWING HANDLERS ----------------
  const startDrawing = (pos: { x: number; y: number }) => {
    const stroke: Stroke = {
      id: genId(),
      points: [pos.x, pos.y],
      color: brushColor,
      size: brushSize,
      erasing: tool === "eraser",
    };
    setCurrentStroke(stroke);
    setIsDrawing(true);
  };

  const handleMouseDown = () => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    startDrawing(pos);
  };

  const handleMouseMove = () => {
    if (!isDrawing || !currentStroke) return;

    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;

    setCurrentStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, pos.x, pos.y] } : prev
    );
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (!currentStroke) return;

    addStrokeLocal(currentStroke);

    const socket = getSocket();
    socket?.emit("drawing-action", sessionId, currentStroke);

    setCurrentStroke(null);
  };

  // ---------------- UNDO / REDO ----------------
  const handleUndo = () => {
    const strokeId = undoLocal();
    if (!strokeId) return;

    getSocket()?.emit("remove-stroke", sessionId, strokeId);
  };

  const handleRedo = () => {
    const strokeId = redoLocal();
    if (!strokeId) return;

    const added = strokes.find((s) => s.id === strokeId);
    if (added) {
      getSocket()?.emit("drawing-action", sessionId, added);
    }
  };

  // ---------------- SAVE AS PNG ----------------
  const exportImage = () => {
    if (!stageRef.current) return;

    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${sessionId}-whiteboard.png`;
    link.click();
  };

  // ---------------- SAVE AS PDF ----------------
  const exportPDF = async () => {
    if (!stageRef.current) return;

    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const width = pdf.internal.pageSize.getWidth();
    const height = (imgProps.height * width) / imgProps.width;

    pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
    pdf.save(`${sessionId}-whiteboard.pdf`);
  };

  // ---------------- UI ----------------
  return (
    <div className="container-fluid mt-2">

      <Toolbar
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        tool={tool}
        setTool={setTool}
        undo={handleUndo}
        redo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        saveImage={exportImage}
        savePDF={exportPDF}
      />

      <div
        style={{
          border: "1px solid #ddd",
          marginTop: "12px",
          width: "100%",
          height: "70vh",
          background: "#fff",
          borderRadius: 8,
        }}
      >
        <Stage
          width={window.innerWidth * 0.95}
          height={window.innerHeight * 0.65}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {strokes.map((s) => (
              <Line
                key={s.id}
                points={s.points}
                stroke={s.erasing ? "white" : s.color}
                strokeWidth={s.size}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  s.erasing ? "destination-out" : "source-over"
                }
              />
            ))}

            {currentStroke && (
              <Line
                points={currentStroke.points}
                stroke={currentStroke.erasing ? "white" : currentStroke.color}
                strokeWidth={currentStroke.size}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  currentStroke.erasing ? "destination-out" : "source-over"
                }
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
