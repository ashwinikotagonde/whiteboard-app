import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./auth/keycloak";
import 'bootstrap/dist/css/bootstrap.min.css';

keycloak
  .init({ onLoad: "login-required", checkLoginIframe: false })
  .then((authenticated) => {
    if (authenticated) {
      ReactDOM.createRoot(document.getElementById("root")!).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } else {
      keycloak.login();
    }
  })
  .catch((error) => {
    console.error("Keycloak initialization failed:", error);
  });
