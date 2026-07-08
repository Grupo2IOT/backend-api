const plotRepository = require("../repositories/plotRepository");
const auditService = require("./auditService");
const accessService = require("./accessService");
const debugLog = require("../utils/debugLog");

const list = async (user) => {
  console.log("[plots] service start");
  const plots = await plotRepository.findMany(accessService.plotWhereFor(user));
  return plots;
};

const listIds = async (user) => {
  if (accessService.canReadAllPlots(user)) return null;
  const rows = await plotRepository.findIds(accessService.plotWhereFor(user));
  return rows.map((plot) => plot.id);
};

const get = async (id, user) => {
  const plot = await plotRepository.findById(id);
  accessService.ensureCanAccessPlot(user, plot);
  return plot;
};

const create = async (payload, actor) => {
  const plot = await plotRepository.create({ ...payload, ownerId: payload.ownerId || actor.id });
  await plotRepository.assignUser(plot.id, plot.ownerId).catch(() => null);
  await auditService.log({ userId: actor.id, action: "create_plot", entity: "Plot", entityId: plot.id, description: "Crear parcela" });
  return plot;
};

const update = async (id, payload, actor) => {
  await get(id, actor);
  const plot = await plotRepository.update(id, payload);
  await auditService.log({ userId: actor.id, action: "update_plot", entity: "Plot", entityId: id, description: "Editar parcela" });
  return plot;
};

const remove = async (id, actor) => {
  await get(id, actor);
  await plotRepository.remove(id);
  await auditService.log({ userId: actor.id, action: "delete_plot", entity: "Plot", entityId: id, description: "Eliminar parcela" });
};

const assignUser = async (id, userId) => {
  return await plotRepository.assignUser(id, userId);
};

module.exports = { list, listIds, get, create, update, remove, assignUser };
