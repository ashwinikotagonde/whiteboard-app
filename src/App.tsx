import { useEffect, useState } from "react";
import keycloak from "./auth/keycloak";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Session from "./pages/Session";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session/:id" element={<Session />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
