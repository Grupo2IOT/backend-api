const alertRepository = require("../repositories/alertRepository");
const plotService = require("./plotService");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const list = async (user) => {
  const plots = await plotService.list(user);
  return alertRepository.findMany({ where: { plotId: { in: plots.map((plot) => plot.id) } }, orderBy: { createdAt: "desc" } });
};

const get = async (id, user) => {
  const alert = await alertRepository.findById(id);
  if (!alert) throw new AppError("Alerta no encontrada", 404);
  await plotService.get(alert.plotId, user);
  return alert;
};

const create = async (payload, user) => {
  await plotService.get(payload.plotId, user);
  return alertRepository.create({ status: "open", ...payload });
};

const update = async (id, payload, user) => {
  await get(id, user);
  return alertRepository.update(id, payload);
};

const resolve = async (id, user) => {
  await get(id, user);
  const alert = await alertRepository.update(id, { status: "resolved", resolvedAt: new Date() });
  await auditService.log({ userId: user.id, action: "resolve_alert", entity: "Alert", entityId: id, description: "Resolver alerta" });
  return alert;
};

const remove = async (id, user) => {
  await get(id, user);
  return alertRepository.delete(id);
};

module.exports = { list, get, create, update, resolve, remove };
