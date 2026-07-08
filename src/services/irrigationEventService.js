const irrigationEventRepository = require("../repositories/irrigationEventRepository");
const plotService = require("./plotService");
const deviceService = require("./deviceService");

const list = async (user) => {
  const plots = await plotService.list(user);
  return irrigationEventRepository.findMany({ where: { plotId: { in: plots.map((plot) => plot.id) } }, orderBy: { createdAt: "desc" } });
};

const byPlot = async (plotId, user) => {
  await plotService.get(plotId, user);
  return irrigationEventRepository.findMany({ where: { plotId }, orderBy: { createdAt: "desc" } });
};

const byDevice = async (deviceId, user) => {
  await deviceService.get(deviceId, user);
  return irrigationEventRepository.findMany({ where: { deviceId }, orderBy: { createdAt: "desc" } });
};

module.exports = { list, byPlot, byDevice };
