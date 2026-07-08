const irrigationRuleRepository = require("../repositories/irrigationRuleRepository");
const plotService = require("./plotService");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const list = async (user) => {
  const plots = await plotService.list(user);
  return irrigationRuleRepository.findMany({ where: { plotId: { in: plots.map((plot) => plot.id) } } });
};

const byPlot = async (plotId, user) => {
  await plotService.get(plotId, user);
  return irrigationRuleRepository.findMany({ where: { plotId } });
};

const assertRange = (payload) => {
  if (Number(payload.minSoilMoisture) > Number(payload.maxSoilMoisture)) {
    throw new AppError("minSoilMoisture no puede ser mayor que maxSoilMoisture", 422);
  }
};

const create = async (payload, user) => {
  assertRange(payload);
  await plotService.get(payload.plotId, user);
  return irrigationRuleRepository.create(payload);
};

const update = async (id, payload, user) => {
  assertRange(payload);
  const current = await irrigationRuleRepository.findById(id);
  if (!current) throw new AppError("Regla de riego no encontrada", 404);
  await plotService.get(current.plotId, user);
  const rule = await irrigationRuleRepository.update(id, payload);
  await auditService.log({ userId: user.id, action: "update_irrigation_rule", entity: "IrrigationRule", entityId: id, description: "Actualizar regla de riego" });
  return rule;
};

const remove = async (id, user) => {
  const current = await irrigationRuleRepository.findById(id);
  if (!current) throw new AppError("Regla de riego no encontrada", 404);
  await plotService.get(current.plotId, user);
  return irrigationRuleRepository.delete(id);
};

module.exports = { list, byPlot, create, update, remove };
