const reportRepository = require("../repositories/reportRepository");
const telemetryRepository = require("../repositories/telemetryRepository");
const irrigationEventService = require("./irrigationEventService");
const alertService = require("./alertService");
const plotService = require("./plotService");

const create = async (payload, user) => {
  if (payload.plotId) await plotService.get(payload.plotId, user);
  return reportRepository.create({
    ...payload,
    periodStart: new Date(payload.periodStart),
    periodEnd: new Date(payload.periodEnd),
    userId: payload.userId || user.id,
  });
};

const waterUsage = async (user) => {
  const plots = await plotService.list(user);
  if (!plots.length) return [];
  return telemetryRepository.history({
    waterPumpOn: true,
    device: { plotId: { in: plots.map((plot) => plot.id) } },
  }, 200);
};

module.exports = {
  create,
  waterUsage,
  events: irrigationEventService.list,
  alerts: alertService.list,
};
