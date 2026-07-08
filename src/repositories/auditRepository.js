const prisma = require("../config/prisma");

const create = (data) => prisma.auditLog.create({ data });
const findMany = (where = {}) =>
  prisma.auditLog.findMany({
    where,
    include: { user: { select: { id: true, email: true, profile: true } } },
    orderBy: { createdAt: "desc" },
  });

module.exports = { create, findMany };
