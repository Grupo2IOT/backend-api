const prisma = require("../config/prisma");
const debugLog = require("../utils/debugLog");
const { withQueryTimeout } = require("../utils/queryTimeout");

const include = { owner: { select: { id: true, email: true, profile: true } }, users: true, devices: true, irrigationRule: true };

const findMany = async (where = {}) => {
  console.log("[plots] repository start");
  const data = await withQueryTimeout(
    prisma.plot.findMany({ where, include, orderBy: { createdAt: "desc" }, take: 100 }),
    "plot.findMany"
  );
  console.log("[plots] repository end");
  return data || [];
};

const findIds = async (where = {}) => {
  debugLog("plotRepository.findIds", "start");
  const data = await withQueryTimeout(
    prisma.plot.findMany({ where, select: { id: true }, take: 500 }),
    "plot.findIds"
  );
  debugLog("plotRepository.findIds", "end");
  return data || [];
};

const findById = (id) => prisma.plot.findUnique({ where: { id }, include });
const create = (data) => prisma.plot.create({ data, include });
const update = (id, data) => prisma.plot.update({ where: { id }, data, include });
const remove = (id) => prisma.plot.delete({ where: { id } });
const assignUser = (plotId, userId) => prisma.userPlot.create({ data: { plotId, userId } });
const userHasPlot = (userId, plotId) => prisma.userPlot.findUnique({ where: { userId_plotId: { userId, plotId } } });

module.exports = { findMany, findIds, findById, create, update, remove, assignUser, userHasPlot };
