import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "whiteboard-realm",
  clientId: "whiteboard-spa",
});

export default keycloak;
