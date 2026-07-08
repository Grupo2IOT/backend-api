const prisma = require("../config/prisma");

const includeDevice = { device: { include: { plot: { include: { irrigationRule: true } } } } };

const latest = async (where = {}) => {
  const data = await prisma.telemetry.findFirst({
    where,
    orderBy: { createdAt: "desc" },
  });
  return data || null;
};

const history = async (where = {}, take = 100) => {
  const data = await prisma.telemetry.findMany({
    where,
    take,
    include: includeDevice,
    orderBy: { createdAt: "desc" },
  });
  return data || [];
};

module.exports = { latest, history };
