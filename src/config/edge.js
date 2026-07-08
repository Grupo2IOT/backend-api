require("dotenv").config();

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

module.exports = {
  baseURL: (process.env.EDGE_API_URL || "http://127.0.0.1:5000").replace(/\/+$/, ""),
  apiKey: process.env.EDGE_API_KEY || "",
  syncEnabled: (process.env.EDGE_SYNC_ENABLED || "false").toLowerCase() === "true",
  syncIntervalSec: parsePositiveInteger(process.env.EDGE_SYNC_INTERVAL, 30),
  timeoutMs: parsePositiveInteger(process.env.EDGE_API_TIMEOUT_MS, 2000),
};
