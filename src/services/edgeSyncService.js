const edgeConfig = require("../config/edge");
const edgeApiService = require("./edgeApiService");
const edgeRepository = require("../repositories/edgeRepository");
const auditService = require("./auditService");
const alertService = require("./alertService");
const {
  readingToTelemetry,
  commandAcknowledged,
  commandToEdge,
  getDeviceCode,
} = require("../utils/edgeMapper");

let syncInProgress = false;
let timer = null;
let schedulerStarted = false;
let lastSync = null;
let lastResult = null;
let lastError = null;
let latency = null;
let telemetrySynced = 0;
let commandsSent = 0;
let commandsFailed = 0;

const reconcileCommands = async (reading, telemetry, device) => {
  const delivered = await edgeRepository.findDeliveredCommands(device.id, telemetry.createdAt);
  let executed = 0;
  for (const command of delivered) {
    if (!commandAcknowledged(command, reading)) continue;
    await edgeRepository.markCommandExecuted(command.id, telemetry.createdAt);
    await edgeRepository.updateIrrigationEventByCommand(command.id, {
      ...(command.state === "ON"
        ? { startedAt: telemetry.createdAt }
        : { endedAt: telemetry.createdAt }),
    });
    executed += 1;
  }
  return executed;
};

const syncPendingCommands = async () => {
  const pendingCommands = await edgeRepository.findPendingCommands();
  const result = { delivered: 0, rejected: 0, unavailableError: null };

  for (const command of pendingCommands) {
    try {
      await edgeApiService.sendCommand(commandToEdge(command, command.device.deviceCode));
      const deliveredAt = new Date();
      await edgeRepository.markCommandDelivered(command.id, deliveredAt);
      await edgeRepository.ensureIrrigationEvent({
        plotId: command.device.plotId,
        deviceId: command.deviceId,
        commandId: command.id,
        eventType: `MANUAL_${command.target.toUpperCase()}_${command.state}`,
        durationSec: command.durationSec || (command.state === "OFF" ? 1 : 10),
        ...(command.state === "ON" ? { startedAt: deliveredAt } : { endedAt: deliveredAt }),
      });
      await auditService.log({
        userId: null,
        action: "EDGE_COMMAND_SENT",
        entity: "PendingCommand",
        entityId: command.id,
        description: `Command accepted by edge-compatible service at ${edgeConfig.baseURL}`,
      });
      commandsSent += 1;
      result.delivered += 1;
    } catch (error) {
      await edgeRepository.markCommandRejected(command.id);
      await auditService.log({
        userId: null,
        action: "EDGE_COMMAND_FAILED",
        entity: "PendingCommand",
        entityId: command.id,
        description: error.message,
      });
      commandsFailed += 1;
      result.rejected += 1;
      if (error.statusCode === 502 || error.statusCode === 504) {
        result.unavailableError = error;
        break;
      }
    }
  }

  return result;
};

const sync = async ({ deviceId, limit = 100 } = {}) => {
  if (syncInProgress) {
    return {
      received: 0,
      created: 0,
      skipped: 0,
      unknownDevices: [],
      alertsCreated: 0,
      commandsProcessed: 0,
      source: "edge-compatible",
      reason: "Sync already in progress",
    };
  }

  syncInProgress = true;
  console.log("[edge/sync] start");

  try {
    const commandResult = await syncPendingCommands();
    if (commandResult.unavailableError) throw commandResult.unavailableError;
    const response = await edgeApiService.readings({ deviceId, limit });
    const readings = [...response.data].reverse();
    const result = {
      received: readings.length,
      created: 0,
      skipped: 0,
      alertsCreated: 0,
      commandsProcessed: commandResult.delivered + commandResult.rejected,
      unknownDevices: [],
      source: "edge-compatible",
    };

    for (const reading of readings) {
      const deviceCode = getDeviceCode(reading);
      const device = deviceCode ? await edgeRepository.findDeviceByCode(deviceCode) : null;

      if (!device) {
        console.warn(`[edge/sync] Unknown device "${deviceCode || "missing-device-code"}", reading skipped`);
        if (deviceCode && !result.unknownDevices.includes(deviceCode)) {
          result.unknownDevices.push(deviceCode);
        }
        result.skipped += 1;
        continue;
      }

      const telemetry = readingToTelemetry(reading, device.id);
      const existing = await edgeRepository.findMatchingTelemetry(telemetry);

      if (existing) {
        result.skipped += 1;
      } else {
        await edgeRepository.createTelemetry(telemetry);
        result.created += 1;
        result.alertsCreated += await alertService.generateFromTelemetry(telemetry, device);
      }

      result.commandsProcessed += await reconcileCommands(reading, telemetry, device);
      await edgeRepository.markDeviceOnline(device.id, {
        createdAt: telemetry.createdAt,
        firmwareVersion: reading.firmware_version || reading.firmwareVersion,
      });
    }

    lastSync = new Date();
    lastResult = result;
    lastError = null;
    latency = response.latencyMs;
    telemetrySynced += result.created;
    console.log(`[edge/sync] end (${result.created} created, ${result.skipped} skipped)`);
    return result;
  } catch (error) {
    lastError = { message: error.message, at: new Date() };
    await auditService.log({
      userId: null,
      action: "edge_sync_failed",
      entity: "EdgeAPI",
      entityId: null,
      description: error.message,
    });
    console.error(`[edge/sync] failed: ${error.message}`);
    return {
      received: 0,
      created: 0,
      skipped: 0,
      unknownDevices: [],
      alertsCreated: 0,
      commandsProcessed: 0,
      source: "edge-compatible",
      error: error.message,
    };
  } finally {
    syncInProgress = false;
  }
};

const status = () => {
  const connection = edgeApiService.connectionStatus();
  return {
  connected: connection.connected,
  sourceUrl: edgeConfig.baseURL,
  edgeCompatible: connection.edgeCompatible,
  syncEnabled: edgeConfig.syncEnabled,
  syncInProgress,
  lastSync,
  lastError: lastError || connection.lastError,
  latency: latency ?? connection.latency,
  syncInterval: edgeConfig.syncIntervalSec,
  telemetrySynced,
  commandsSent,
  commandsFailed,
  lastResult,
  };
};

const statistics = async () => ({
  ...(await edgeRepository.statistics()),
  lastSync,
});

const recordCommandResult = (sent) => {
  if (sent) commandsSent += 1;
  else commandsFailed += 1;
};

const scheduleNext = () => {
  timer = setTimeout(async () => {
    await sync();
    scheduleNext();
  }, edgeConfig.syncIntervalSec * 1000);
  timer.unref();
};

const start = () => {
  if (!edgeConfig.syncEnabled || schedulerStarted) return;

  schedulerStarted = true;
  console.log(`[edge/sync] scheduler enabled every ${edgeConfig.syncIntervalSec}s`);
  sync().finally(scheduleNext);
};

module.exports = { sync, status, statistics, recordCommandResult, start };
