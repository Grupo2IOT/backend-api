const WATER_LEVEL_MAP = {
  EMPTY: "EMPTY",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  FULL: "FULL",
  SUFFICIENT: "FULL",
};

const SYSTEM_HEALTH_MAP = {
  HEALTHY: "OK",
  OK: "OK",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
};

const firstDefined = (reading, fields) => {
  for (const field of fields) {
    if (reading[field] !== undefined && reading[field] !== null) return reading[field];
  }
  return null;
};

const validValue = (reading, valueFields, validFields = []) => {
  for (const validField of validFields) {
    if (reading[validField] === 0 || reading[validField] === false) return null;
  }
  return firstDefined(reading, valueFields);
};

const parseEdgeDate = (value) => {
  if (!value) return new Date();
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const normalizeWaterLevel = (value) => {
  if (!value) return null;
  const normalized = WATER_LEVEL_MAP[String(value).toUpperCase()];
  if (!normalized) {
    console.warn(`[edge/mapper] Unknown water level "${value}", using FULL`);
    return "FULL";
  }
  return normalized;
};

const normalizeSystemHealth = (value) => {
  if (!value) return "OK";
  const normalized = SYSTEM_HEALTH_MAP[String(value).toUpperCase()];
  if (!normalized) {
    console.warn(`[edge/mapper] Unknown system health "${value}", using WARNING`);
    return "WARNING";
  }
  return normalized;
};

const readingToTelemetry = (reading, deviceId) => ({
  deviceId,
  soilMoisture: validValue(reading, ["soil_moisture_value", "soil_moisture"], ["soil_moisture_is_valid"]),
  soilFertility: validValue(reading, ["soil_fertility_value", "soil_fertility"], ["soil_fertility_is_valid"]),
  soilTemperature: validValue(
    reading,
    ["soil_temperature_value", "soil_temp_value", "soil_temperature"],
    ["soil_temperature_is_valid", "soil_temp_is_valid"]
  ),
  airTemperature: validValue(
    reading,
    ["air_temperature_value", "air_temp_value", "air_temperature"],
    ["air_is_valid"]
  ),
  airHumidity: validValue(
    reading,
    ["air_humidity_value", "air_humidity"],
    ["air_is_valid"]
  ),
  waterLevel:
    reading.water_level_is_valid === 0 || reading.water_level_is_valid === false
      ? null
      : normalizeWaterLevel(firstDefined(reading, ["water_level_status", "water_level"])),
  waterPumpOn:
    String(firstDefined(reading, ["water_pump_state", "water_pump"]) || "").toUpperCase() === "ON",
  fertilizerPumpOn:
    String(firstDefined(reading, ["fertilizer_pump_state", "fertilizer_pump"]) || "").toUpperCase() === "ON",
  systemHealth: normalizeSystemHealth(firstDefined(reading, ["system_health_overall", "system_health"])),
  createdAt: parseEdgeDate(
    firstDefined(reading, ["created_at", "received_at", "timestamp", "timestamp_utc"])
  ),
});

const getDeviceCode = (reading) =>
  firstDefined(reading, ["device_id", "deviceId", "deviceCode"]);

const commandToEdge = (command, deviceCode) => {
  const payload = {
    device_id: deviceCode,
    target: command.target,
    state: command.state,
  };

  // Always send duration_sec because compatible implementations may require it for OFF.
  payload.duration_sec = command.durationSec || (command.state === "OFF" ? 1 : 10);
  return payload;
};

const commandAcknowledged = (command, reading) => {
  const acknowledgements = Array.isArray(reading.pending_commands) ? reading.pending_commands : [];
  const targetToken = command.target === "water_pump" ? "water" : "fertilizer";
  const explicitExecution = acknowledgements.some((item) => {
    if (!item || item.executed !== true) return false;
    const commandName = String(item.command || item.target || "").toLowerCase();
    const state = item.state ? String(item.state).toUpperCase() : null;
    return commandName.includes(targetToken) && (!state || state === command.state);
  });

  if (explicitExecution) return true;

  const actualState =
    command.target === "water_pump"
      ? String(firstDefined(reading, ["water_pump_state", "water_pump"]) || "").toUpperCase()
      : String(firstDefined(reading, ["fertilizer_pump_state", "fertilizer_pump"]) || "").toUpperCase();
  return actualState === command.state;
};

module.exports = {
  readingToTelemetry,
  commandToEdge,
  normalizeWaterLevel,
  normalizeSystemHealth,
  commandAcknowledged,
  getDeviceCode,
};
