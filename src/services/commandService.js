const commandRepository = require("../repositories/commandRepository");
const deviceService = require("./deviceService");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");
const edgeApiService = require("./edgeApiService");
const { commandToEdge } = require("../utils/edgeMapper");
const edgeSyncService = require("./edgeSyncService");
const edgeRepository = require("../repositories/edgeRepository");

const list = async (user, where = {}) => {
  const devices = await deviceService.list(user);
  return await commandRepository.findMany({
    where: { deviceId: { in: devices.map((device) => device.id) }, ...where },
    orderBy: { createdAt: "desc" },
  });
};

const create = async (payload, user) => {
  const device = await deviceService.get(payload.deviceId, user);
  const command = await commandRepository.create({ ...payload, status: "pending" });

  let edgeResponse;
  try {
    edgeResponse = await edgeApiService.sendCommand(commandToEdge(command, device.deviceCode));
  } catch (error) {
    edgeSyncService.recordCommandResult(false);
    const rejected = await commandRepository.update(command.id, { status: "rejected" });
    void auditService.log({
      userId: user.id,
      action: "create_command",
      entity: "PendingCommand",
      entityId: command.id,
      description: "Crear comando para dispositivo",
    });
    void auditService.log({
      userId: user.id,
      action: "EDGE_COMMAND_FAILED",
      entity: "PendingCommand",
      entityId: command.id,
      description: `Edge API rechazó el comando: ${error.message}`,
    });
    return rejected;
  }

  const deliveredAt = new Date();
  edgeSyncService.recordCommandResult(true);
  const [delivered] = await Promise.all([
    commandRepository.update(command.id, {
      status: "delivered",
      deliveredAt,
    }),
    edgeRepository.ensureIrrigationEvent({
      plotId: device.plotId,
      deviceId: device.id,
      commandId: command.id,
      eventType: `MANUAL_${command.target.toUpperCase()}_${command.state}`,
      durationSec: command.durationSec || (command.state === "OFF" ? 1 : 10),
      ...(command.state === "ON" ? { startedAt: deliveredAt } : { endedAt: deliveredAt }),
    }),
  ]);
  void auditService.log({
    userId: user.id,
    action: "create_command",
    entity: "PendingCommand",
    entityId: command.id,
    description: "Crear comando para dispositivo",
  });
  void auditService.log({
    userId: user.id,
    action: "EDGE_COMMAND_SENT",
    entity: "PendingCommand",
    entityId: command.id,
    description: `Command accepted by edge-compatible service for ${device.deviceCode}`,
  });
  return delivered;
};

const updateStatus = async (id, payload, user) => {
  const command = await commandRepository.findById(id);
  if (!command) throw new AppError("Comando no encontrado", 404);
  await deviceService.get(command.deviceId, user);
  return await commandRepository.update(id, {
    status: payload.status,
    deliveredAt: payload.deliveredAt ? new Date(payload.deliveredAt) : undefined,
    executedAt: payload.executedAt ? new Date(payload.executedAt) : undefined,
  });
};

module.exports = {
  list,
  pending: async (user) => await list(user, { status: "pending" }),
  byDevice: async (deviceId, user) => await list(user, { deviceId }),
  create,
  updateStatus,
};
