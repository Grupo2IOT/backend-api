const prisma = require("../config/prisma");

const findMany = () => prisma.role.findMany({ orderBy: { name: "asc" } });
const upsertBaseRoles = (roles) =>
  Promise.all(
    roles.map((role) =>
      prisma.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: role,
      })
    )
  );

module.exports = { findMany, upsertBaseRoles };
