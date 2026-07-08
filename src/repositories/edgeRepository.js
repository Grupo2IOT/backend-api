const prisma = require("../config/prisma");

const findDeviceByCode = async (deviceCode) =>
  await prisma.device.findUnique({ where: { deviceCode } });

const findMatchingTelemetry = async (data) =>
  await prisma.telemetry.findFirst({
    where: {
      deviceId: data.deviceId,
      createdAt: data.createdAt,
      soilMoisture: data.soilMoisture,
      soilFertility: data.soilFertility,
      soilTemperature: data.soilTemperature,
      airTemperature: data.airTemperature,
      airHumidity: data.airHumidity,
      waterLevel: data.waterLevel,
      waterPumpOn: data.waterPumpOn,
      fertilizerPumpOn: data.fertilizerPumpOn,
      systemHealth: data.systemHealth,
    },
    select: { id: true },
  });

const createTelemetry = async (data) => await prisma.telemetry.create({ data });

const markDeviceOnline = async (id, reading) =>
  await prisma.device.update({
    where: { id },
    data: {
      status: "ONLINE",
      lastSeenAt: reading.createdAt,
      ...(reading.firmwareVersion ? { firmwareVersion: reading.firmwareVersion } : {}),
    },
  });

const findDeliveredCommands = async (deviceId, readingAt) =>
  await prisma.pendingCommand.findMany({
    where: {
      deviceId,
      status: "delivered",
      deliveredAt: { lte: readingAt },
    },
    orderBy: { deliveredAt: "asc" },
  });

const findPendingCommands = async () =>
  await prisma.pendingCommand.findMany({
    where: { status: "pending" },
    include: { device: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

const markCommandDelivered = async (id, deliveredAt) =>
  await prisma.pendingCommand.update({
    where: { id },
    data: { status: "delivered", deliveredAt },
  });

const markCommandRejected = async (id) =>
  await prisma.pendingCommand.update({
    where: { id },
    data: { status: "rejected" },
  });

const markCommandExecuted = async (id, executedAt) =>
  await prisma.pendingCommand.update({
    where: { id },
    data: { status: "executed", executedAt },
  });

const createIrrigationEvent = async (data) =>
  await prisma.irrigationEvent.create({ data });

const ensureIrrigationEvent = async (data) => {
  const existing = await prisma.irrigationEvent.findFirst({
    where: { commandId: data.commandId },
  });
  return existing || await createIrrigationEvent(data);
};

const updateIrrigationEventByCommand = async (commandId, data) => {
  const event = await prisma.irrigationEvent.findFirst({
    where: { commandId },
    select: { id: true },
  });
  if (!event) return null;
  return await prisma.irrigationEvent.update({ where: { id: event.id }, data });
};

const statistics = async () => {
  const [
    telemetry,
    commands,
    commandsByStatus,
    alerts,
    alertsByStatus,
    devices,
    devicesByStatus,
  ] = await Promise.all([
    prisma.telemetry.count(),
    prisma.pendingCommand.count(),
    prisma.pendingCommand.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.alert.count(),
    prisma.alert.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.device.count(),
    prisma.device.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const grouped = (rows) =>
    Object.fromEntries(rows.map((row) => [row.status, row._count._all]));

  return {
    telemetry: { total: telemetry },
    commands: { total: commands, ...grouped(commandsByStatus) },
    alerts: { total: alerts, ...grouped(alertsByStatus) },
    devices: { total: devices, ...grouped(devicesByStatus) },
  };
};

module.exports = {
  findDeviceByCode,
  findMatchingTelemetry,
  createTelemetry,
  markDeviceOnline,
  findDeliveredCommands,
  findPendingCommands,
  markCommandDelivered,
  markCommandRejected,
  markCommandExecuted,
  createIrrigationEvent,
  ensureIrrigationEvent,
  updateIrrigationEventByCommand,
  statistics,
};
