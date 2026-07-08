const axios = require("axios");
const edgeConfig = require("../config/edge");
const AppError = require("../utils/AppError");
const auditService = require("./auditService");

const client = axios.create({
  baseURL: edgeConfig.baseURL,
  timeout: edgeConfig.timeoutMs,
  headers: edgeConfig.apiKey ? { "X-API-Key": edgeConfig.apiKey } : {},
});

const MAX_ATTEMPTS = 3;
let connected = false;
let edgeCompatible = false;
let lastLatencyMs = null;
let lastConnectionError = null;

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const shouldRetry = (error) =>
  !error.response || error.code === "ECONNABORTED" || error.response.status === 429 || error.response.status >= 500;

const toAppError = (error, operation) => {
  if (error.code === "ECONNABORTED") {
    return new AppError(`Edge API timeout during ${operation}`, 504);
  }

  if (error.response) {
    const message = error.response.data?.error || `Edge API rejected ${operation}`;
    return new AppError(message, 502, [{ edgeStatus: error.response.status }]);
  }

  return new AppError(`Edge API unavailable during ${operation}`, 502);
};

const request = async (operation, config) => {
  console.log(`[edge] ${operation} start`);
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await client.request(config);
      const latencyMs = Date.now() - startedAt;
      connected = true;
      edgeCompatible = true;
      lastLatencyMs = latencyMs;
      lastConnectionError = null;
      console.log(`[edge] ${operation} end (${response.status}, ${latencyMs}ms, attempt ${attempt})`);
      return { data: response.data, status: response.status, latencyMs, attempts: attempt };
    } catch (error) {
      const retry = attempt < MAX_ATTEMPTS && shouldRetry(error);
      console.error(`[edge] ${operation} attempt ${attempt} failed: ${error.message}`);
      if (!retry) {
        const appError = toAppError(error, operation);
        connected = false;
        lastConnectionError = { message: appError.message, at: new Date() };
        setImmediate(() => {
          void auditService.log({
            userId: null,
            action: "edge_request_failed",
            entity: "EdgeAPI",
            entityId: null,
            description: `${operation}: ${appError.message}`,
          });
        });
        throw appError;
      }
      await wait(250 * attempt);
    }
  }
};

const health = async () => await request("health", { method: "GET", url: "/health" });

const normalizeReadings = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["readings", "data", "rows"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

const readings = async ({ deviceId, limit = 100 } = {}) => {
  const response = await request("readings", {
    method: "GET",
    url: "/api/v1/readings",
    params: { ...(deviceId ? { device_id: deviceId } : {}), limit },
  });
  return { ...response, data: normalizeReadings(response.data) };
};

const sendCommand = async (payload) =>
  await request("command", {
    method: "POST",
    url: "/api/v1/command",
    data: payload,
  });

const connectionStatus = () => ({
  connected,
  edgeCompatible,
  latency: lastLatencyMs,
  lastError: lastConnectionError,
});

module.exports = {
  health,
  readings,
  sendCommand,
  normalizeReadings,
  connectionStatus,
};
