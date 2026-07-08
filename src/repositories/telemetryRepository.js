const prisma = require("../config/prisma");

const includeDevice = { device: { include: { plot: { include: { irrigationRule: true } } } } };

const latest = (where = {}) =>
  prisma.telemetry.findMany({
    where,
    include: includeDevice,
    distinct: ["deviceId"],
    orderBy: [{ deviceId: "asc" }, { createdAt: "desc" }],
  });

const history = (where = {}, take = 100) =>
  prisma.telemetry.findMany({
    where,
    take,
    include: includeDevice,
    orderBy: { createdAt: "desc" },
  });

module.exports = { latest, history };
