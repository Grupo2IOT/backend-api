const telemetryRepository = require("../repositories/telemetryRepository");
const alertRepository = require("../repositories/alertRepository");
const plotService = require("./plotService");

const evaluateAlerts = async (items) => {
  const alerts = [];
  for (const telemetry of items) {
    const device = telemetry.device;
    const plot = device.plot;
    const rule = plot.irrigationRule;
    const candidates = [];

    if (rule && telemetry.soilMoisture !== null && Number(telemetry.soilMoisture) < Number(rule.minSoilMoisture)) {
      candidates.push(["HUMEDAD_BAJA", "HIGH", "Humedad baja", "La humedad del suelo está por debajo del mínimo configurado"]);
    }
    if (telemetry.soilFertility !== null && Number(telemetry.soilFertility) < 2.5) {
      candidates.push(["FERTILIDAD_BAJA", "MEDIUM", "Fertilidad baja", "La fertilidad del suelo está por debajo del umbral"]);
    }
    if (telemetry.waterLevel === "EMPTY") candidates.push(["TANQUE_VACIO", "CRITICAL", "Tanque vacío", "El tanque de agua está vacío"]);
    if (telemetry.systemHealth !== "OK") candidates.push(["SISTEMA_CON_PROBLEMAS", "HIGH", "Sistema con problemas", "El dispositivo reporta salud distinta de OK"]);
    if (device.status === "OFFLINE") candidates.push(["DISPOSITIVO_OFFLINE", "HIGH", "Dispositivo offline", "El dispositivo se encuentra offline"]);

    for (const [type, severity, title, message] of candidates) {
      const alert = await alertRepository.create({ plotId: plot.id, deviceId: device.id, type, severity, title, message });
      alerts.push(alert);
    }
  }
  return alerts;
};

const latest = async (user) => {
  const plots = await plotService.list(user);
  const data = plots.length ? await telemetryRepository.latest({ device: { plotId: { in: plots.map((plot) => plot.id) } } }) : [];
  const generatedAlerts = data.length ? await evaluateAlerts(data) : [];
  return { telemetry: data, generatedAlerts };
};

const history = async (user, filters = {}) => {
  const plots = await plotService.list(user);
  if (!plots.length) return [];
  return telemetryRepository.history({ device: { plotId: { in: plots.map((plot) => plot.id) } }, ...filters }, filters.take || 100);
};

const byDevice = async (deviceId, user) => history(user, { deviceId });
const byPlot = async (plotId, user) => {
  await plotService.get(plotId, user);
  return telemetryRepository.history({ device: { plotId } });
};

module.exports = { latest, history, byDevice, byPlot };
