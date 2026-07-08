const commandRepository = require("../repositories/commandRepository");
const deviceService = require("./deviceService");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const list = async (user, where = {}) => {
  const devices = await deviceService.list(user);
  return commandRepository.findMany({
    where: { deviceId: { in: devices.map((device) => device.id) }, ...where },
    orderBy: { createdAt: "desc" },
  });
};

const create = async (payload, user) => {
  await deviceService.get(payload.deviceId, user);
  const command = await commandRepository.create({ ...payload, status: "pending" });
  await auditService.log({ userId: user.id, action: "create_command", entity: "PendingCommand", entityId: command.id, description: "Crear comando para dispositivo" });
  return command;
};

const updateStatus = async (id, payload, user) => {
  const command = await commandRepository.findById(id);
  if (!command) throw new AppError("Comando no encontrado", 404);
  await deviceService.get(command.deviceId, user);
  return commandRepository.update(id, {
    status: payload.status,
    deliveredAt: payload.deliveredAt ? new Date(payload.deliveredAt) : undefined,
    executedAt: payload.executedAt ? new Date(payload.executedAt) : undefined,
  });
};

module.exports = {
  list,
  pending: (user) => list(user, { status: "pending" }),
  byDevice: (deviceId, user) => list(user, { deviceId }),
  create,
  updateStatus,
};
