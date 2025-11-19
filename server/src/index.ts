// server/src/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

// In-memory store types (if you use them already)
type Stroke = {
  id: string;
  points: number[];
  color: string;
  size: number;
  erasing: boolean;
  userId?: string;
};

// cursor payload type
type CursorPayload = {
  x: number;
  y: number;
  userId: string;
  name?: string;
  color?: string; // optional color to show user cursor color
};

const sessions = new Map<string, Stroke[]>();

const io = new Server(server, {
  cors: { origin: "*" },
});

app.get("/", (_req, res) => res.send("Whiteboard Socket Server Running..."));

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);
  const { sessionId } = socket.handshake.query as { sessionId?: string };

  if (sessionId) {
    socket.join(sessionId);
    const existing = sessions.get(sessionId) || [];
    socket.emit("session-data", existing);
  }

  socket.on("join-session", (roomId: string) => {
    socket.join(roomId);
    const existing = sessions.get(roomId) || [];
    socket.emit("session-data", existing);
    socket.to(roomId).emit("user-joined", { socketId: socket.id });
  });

  socket.on("drawing-action", (roomId: string, stroke: Stroke) => {
    const arr = sessions.get(roomId) || [];
    if (!arr.find((s) => s.id === stroke.id)) arr.push(stroke);
    sessions.set(roomId, arr);
    socket.to(roomId).emit("drawing-action", { socketId: socket.id, stroke });
  });

  socket.on("remove-stroke", (roomId: string, strokeId: string) => {
    const arr = sessions.get(roomId) || [];
    const newArr = arr.filter((s) => s.id !== strokeId);
    sessions.set(roomId, newArr);
    socket.to(roomId).emit("remove-stroke", { socketId: socket.id, strokeId });
  });

  // ---------- CURSOR MOVES ----------
  socket.on("cursor-move", (roomId: string, payload: CursorPayload) => {
    // broadcast to everyone else in room
    socket.to(roomId).emit("cursor-move", { socketId: socket.id, payload });
  });

  socket.on("clear-session", (roomId: string) => {
    sessions.set(roomId, []);
    io.to(roomId).emit("clear-session");
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
    // Optionally broadcast leave event to remove cursor UI on other clients
    if (sessionId) {
      socket.to(sessionId).emit("user-left", { socketId: socket.id });
    }
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
server.listen(PORT, () => console.log(`Socket server running on ${PORT}`));
