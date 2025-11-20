// frontend/src/components/Whiteboard/Toolbar.tsx
import React from "react";

type ToolbarProps = {
  brushColor: string;
  setBrushColor: (c: string) => void;

  brushSize: number;
  setBrushSize: (n: number) => void;

  tool: "pen" | "eraser";
  setTool: (t: "pen" | "eraser") => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  saveImage: () => void;  // PNG
  savePDF: () => void;    // PDF **MUST BE HERE**
};

export default function Toolbar({
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  tool,
  setTool,
  undo,
  redo,
  canUndo,
  canRedo,
  saveImage,
  savePDF,
}: ToolbarProps) {
  return (
    <div
      className="d-flex align-items-center gap-2 p-2 bg-light shadow-sm rounded"
      style={{ border: "1px solid #ddd" }}
    >
      {/* Pen */}
      <button
        className={`btn ${tool === "pen" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => setTool("pen")}
      >
        Pen
      </button>

      {/* Eraser */}
      <button
        className={`btn ${tool === "eraser" ? "btn-danger" : "btn-outline-danger"}`}
        onClick={() => setTool("eraser")}
      >
        Eraser
      </button>

      {/* Color Picker */}
      <input
        type="color"
        value={brushColor}
        onChange={(e) => setBrushColor(e.target.value)}
        className="form-control form-control-color"
        title="Choose color"
      />

      {/* Brush Size */}
      <input
        type="range"
        min="2"
        max="25"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
        className="form-range"
        style={{ width: "120px" }}
      />

      {/* Undo */}
      <button
        className="btn btn-warning"
        onClick={undo}
        disabled={!canUndo}
      >
        Undo
      </button>

      {/* Redo */}
      <button
        className="btn btn-warning"
        onClick={redo}
        disabled={!canRedo}
      >
        Redo
      </button>

      {/* Save PNG */}
      <button className="btn btn-success" onClick={saveImage}>
        Save PNG
      </button>

      {/* Save PDF (NEW) */}
      <button className="btn btn-dark" onClick={savePDF}>
        Save PDF
      </button>
    </div>
  );
}
