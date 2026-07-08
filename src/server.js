const app = require("./app");
const env = require("./config/env");

if (!env.jwtSecret || !env.jwtRefreshSecret) {
  console.warn("JWT_SECRET y JWT_REFRESH_SECRET deben configurarse en producción.");
}

app.listen(env.port, () => {
  console.log(`AquaEdge Backend API running on port ${env.port}`);
});
