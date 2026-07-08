const alertRepository = require("../repositories/alertRepository");
const plotService = require("./plotService");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");
const irrigationRuleRepository = require("../repositories/irrigationRuleRepository");

const list = async (user) => {
  const plotIds = await plotService.listIds(user);
  if (plotIds && plotIds.length === 0) return [];
  const alerts = await alertRepository.findMany({
    where: plotIds ? { plotId: { in: plotIds } } : {},
    include: null,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return alerts;
};

const definitionsFromTelemetry = (telemetry, rule) => {
  const definitions = [];
  if (rule && telemetry.soilMoisture !== null && Number(telemetry.soilMoisture) < Number(rule.minSoilMoisture)) {
    definitions.push({
      type: "HUMEDAD_BAJA",
      severity: "HIGH",
      title: "Humedad de suelo baja",
      message: `La humedad está por debajo del mínimo configurado (${rule.minSoilMoisture}%).`,
    });
  }
  if (telemetry.soilFertility !== null && Number(telemetry.soilFertility) < 2.5) {
    definitions.push({
      type: "FERTILIDAD_BAJA",
      severity: "MEDIUM",
      title: "Fertilidad de suelo baja",
      message: "La fertilidad del suelo está por debajo de 2.5.",
    });
  }
  if (telemetry.waterLevel === "EMPTY") {
    definitions.push({
      type: "TANQUE_VACIO",
      severity: "CRITICAL",
      title: "Tanque de agua vacío",
      message: "El dispositivo reportó el tanque de agua vacío.",
    });
  }
  if (telemetry.systemHealth !== "OK") {
    definitions.push({
      type: "SISTEMA_CON_PROBLEMAS",
      severity: telemetry.systemHealth === "CRITICAL" ? "CRITICAL" : "HIGH",
      title: "Sistema con problemas",
      message: `El dispositivo reportó estado ${telemetry.systemHealth}.`,
    });
  }
  return definitions;
};

const generateFromTelemetry = async (telemetry, device) => {
  const rules = await irrigationRuleRepository.findMany({
    where: { plotId: device.plotId },
    take: 1,
  });
  const rule = rules[0] || null;
  let created = 0;

  for (const definition of definitionsFromTelemetry(telemetry, rule)) {
    const existing = await alertRepository.findMany({
      where: {
        plotId: device.plotId,
        deviceId: device.id,
        type: definition.type,
        status: "open",
      },
      take: 1,
    });
    if (existing.length) continue;
    await alertRepository.create({
      plotId: device.plotId,
      deviceId: device.id,
      status: "open",
      ...definition,
    });
    created += 1;
  }

  return created;
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

module.exports = { list, get, create, update, resolve, remove, generateFromTelemetry };
