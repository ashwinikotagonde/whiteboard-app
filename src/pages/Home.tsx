import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState("");

  const createSession = () => {
    const id = Math.random().toString(36).substring(2, 8);
    navigate(`/session/${id}`);
  };

  const joinSession = () => {
    if (sessionId.trim() !== "") navigate(`/session/${sessionId}`);
  };

  return (
    <div className="container mt-5 text-center">
      <h2 className="mb-4">Real-Time Collaborative Whiteboard</h2>

      <div className="mb-3">
        <button className="btn btn-primary" onClick={createSession}>
          + Create New Session
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Enter Session ID"
          className="form-control mb-2"
          onChange={(e) => setSessionId(e.target.value)}
        />
        <button className="btn btn-success" onClick={joinSession}>
          Join Session
        </button>
      </div>
    </div>
  );
}
