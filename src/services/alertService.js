const alertRepository = require("../repositories/alertRepository");
const plotService = require("./plotService");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");
const debugLog = require("../utils/debugLog");

const list = async (user) => {
  console.log("[alerts] service start");
  const plotIds = await plotService.listIds(user);
  if (plotIds && plotIds.length === 0) return [];
  const alerts = await alertRepository.findMany({
    where: plotIds ? { plotId: { in: plotIds } } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return alerts;
};

const get = async (id, user) => {
  const alert = await alertRepository.findById(id);
  if (!alert) throw new AppError("Alerta no encontrada", 404);
  await plotService.get(alert.plotId, user);
  return alert;
};

const create = async (payload, user) => {
  await plotService.get(payload.plotId, user);
  return await alertRepository.create({ status: "open", ...payload });
};

const update = async (id, payload, user) => {
  await get(id, user);
  return await alertRepository.update(id, payload);
};

const resolve = async (id, user) => {
  await get(id, user);
  const alert = await alertRepository.update(id, { status: "resolved", resolvedAt: new Date() });
  await auditService.log({ userId: user.id, action: "resolve_alert", entity: "Alert", entityId: id, description: "Resolver alerta" });
  return alert;
};

const remove = async (id, user) => {
  await get(id, user);
  return await alertRepository.delete(id);
};

module.exports = { list, get, create, update, resolve, remove };
