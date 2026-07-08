const deviceRepository = require("../repositories/deviceRepository");
const plotService = require("./plotService");
const AppError = require("../utils/AppError");
const accessService = require("./accessService");

const list = async (user) => {
  const plotIds = await plotService.listIds(user);
  if (plotIds && plotIds.length === 0) return [];
  const devices = await deviceRepository.findMany({
    where: plotIds ? { plotId: { in: plotIds } } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return devices;
};

const get = async (id, user) => {
  const device = await deviceRepository.findById(id);
  if (!device) throw new AppError("Dispositivo no encontrado", 404);
  if (!accessService.canReadAllPlots(user)) {
    await plotService.get(device.plotId, user);
  }
  return device;
};

const create = async (payload, user) => {
  await plotService.get(payload.plotId, user);
  return await deviceRepository.create(payload);
};

const update = async (id, payload, user) => {
  const current = await get(id, user);
  if (payload.plotId) await plotService.get(payload.plotId, user);
  return await deviceRepository.update(current.id, payload);
};

const remove = async (id, user) => {
  await get(id, user);
  return await deviceRepository.delete(id);
};

module.exports = { list, get, create, update, remove };
