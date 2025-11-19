// frontend/src/components/Whiteboard/useUndoRedo.ts
import { useState } from "react";

export type Stroke = {
  id: string;
  points: number[];
  color: string;
  size: number;
  erasing: boolean;
  userId?: string;
};

export default function useUndoRedo() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [undoStack, setUndoStack] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  const addStrokeLocal = (stroke: Stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    setUndoStack((prev) => [...prev, stroke]);
    setRedoStack([]);
  };

  const addRemoteStroke = (stroke: Stroke) => {
    setStrokes((prev) => {
      if (prev.find((s) => s.id === stroke.id)) return prev;
      return [...prev, stroke];
    });
    setUndoStack((prev) => {
      if (prev.find((s) => s.id === stroke.id)) return prev;
      return [...prev, stroke];
    });
  };

  const removeStrokeById = (id: string) => {
    setStrokes((prev) => prev.filter((s) => s.id !== id));
    setUndoStack((prev) => prev.filter((s) => s.id !== id));
    setRedoStack((prev) => prev.filter((s) => s.id !== id));
  };

  const undoLocal = (): string | null => {
    // pop last stroke from undoStack and move to redoStack
    if (undoStack.length === 0) return null;
    const newUndo = [...undoStack];
    const popped = newUndo.pop()!;
    setUndoStack(newUndo);
    setRedoStack((prev) => [...prev, popped]);
    setStrokes((prev) => prev.filter((s) => s.id !== popped.id));
    return popped.id;
  };

  const redoLocal = (): string | null => {
    if (redoStack.length === 0) return null;
    const newRedo = [...redoStack];
    const stroke = newRedo.pop()!;
    setRedoStack(newRedo);
    setUndoStack((prev) => [...prev, stroke]);
    setStrokes((prev) => [...prev, stroke]);
    return stroke.id;
  };

  const clearAll = () => {
    setStrokes([]);
    setUndoStack([]);
    setRedoStack([]);
  };

  return {
    strokes,
    addStrokeLocal,
    addRemoteStroke,
    removeStrokeById,
    undoLocal,
    redoLocal,
    clearAll,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
