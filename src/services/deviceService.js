const deviceRepository = require("../repositories/deviceRepository");
const plotService = require("./plotService");
const AppError = require("../utils/AppError");

const list = async (user) => {
  const plots = await plotService.list(user);
  return deviceRepository.findMany({ where: { plotId: { in: plots.map((plot) => plot.id) } } });
};

const get = async (id, user) => {
  const device = await deviceRepository.findById(id);
  if (!device) throw new AppError("Dispositivo no encontrado", 404);
  await plotService.get(device.plotId, user);
  return device;
};

const create = async (payload, user) => {
  await plotService.get(payload.plotId, user);
  return deviceRepository.create(payload);
};

const update = async (id, payload, user) => {
  const current = await get(id, user);
  if (payload.plotId) await plotService.get(payload.plotId, user);
  return deviceRepository.update(current.id, payload);
};

const remove = async (id, user) => {
  await get(id, user);
  return deviceRepository.delete(id);
};

module.exports = { list, get, create, update, remove };
