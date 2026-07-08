const telemetryRepository = require("../repositories/telemetryRepository");
const plotService = require("./plotService");

const latest = async (user) => {
  const plotIds = await plotService.listIds(user);
  if (plotIds && plotIds.length === 0) return null;
  return await telemetryRepository.latest(
    plotIds ? { device: { plotId: { in: plotIds } } } : {}
  );
};

const history = async (user, filters = {}) => {
  const plotIds = await plotService.listIds(user);
  if (plotIds && plotIds.length === 0) return [];
  return await telemetryRepository.history({ ...(plotIds ? { device: { plotId: { in: plotIds } } } : {}), ...filters }, filters.take || 100);
};

const byDevice = async (deviceId, user) => {
  return await history(user, { deviceId });
};

const byPlot = async (plotId, user) => {
  await plotService.get(plotId, user);
  return await telemetryRepository.history({ device: { plotId } });
};

module.exports = { latest, history, byDevice, byPlot };
