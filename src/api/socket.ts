import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(sessionId: string) {
  if (socket && socket.connected) return socket;
  socket = io("http://localhost:5000", {
    query: { sessionId },
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
