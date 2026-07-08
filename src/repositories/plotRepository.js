const prisma = require("../config/prisma");

const include = { owner: { select: { id: true, email: true, profile: true } }, users: true, devices: true, irrigationRule: true };

const findMany = (where = {}) => prisma.plot.findMany({ where, include, orderBy: { createdAt: "desc" } });
const findById = (id) => prisma.plot.findUnique({ where: { id }, include });
const create = (data) => prisma.plot.create({ data, include });
const update = (id, data) => prisma.plot.update({ where: { id }, data, include });
const remove = (id) => prisma.plot.delete({ where: { id } });
const assignUser = (plotId, userId) => prisma.userPlot.create({ data: { plotId, userId } });
const userHasPlot = (userId, plotId) => prisma.userPlot.findUnique({ where: { userId_plotId: { userId, plotId } } });

module.exports = { findMany, findById, create, update, remove, assignUser, userHasPlot };
