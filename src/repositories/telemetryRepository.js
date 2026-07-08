const prisma = require("../config/prisma");
const debugLog = require("../utils/debugLog");
const { withQueryTimeout } = require("../utils/queryTimeout");

const includeDevice = { device: { include: { plot: { include: { irrigationRule: true } } } } };

const latest = async (where = {}) => {
  const data = await prisma.telemetry.findFirst({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      device: {
        include: {
          plot: true,
        },
      },
    },
  });
  return data || null;
};

const history = async (where = {}, take = 100) => {
  debugLog("telemetryRepository.history", "start", { take });
  const data = await withQueryTimeout(prisma.telemetry.findMany({
    where,
    take,
    include: includeDevice,
    orderBy: { createdAt: "desc" },
  }), "telemetry.history");
  debugLog("telemetryRepository.history", "end");
  return data || [];
};

module.exports = { latest, history };
