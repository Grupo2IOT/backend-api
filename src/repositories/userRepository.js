const prisma = require("../config/prisma");

const include = {
  profile: true,
  roles: { include: { role: true } },
  plots: { include: { plot: true } },
};

const sanitize = (user) => {
  if (!user) return user;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const findByEmail = (email) => prisma.user.findUnique({ where: { email }, include });
const findById = (id) => prisma.user.findUnique({ where: { id }, include });
const findMany = () => prisma.user.findMany({ include, orderBy: { createdAt: "desc" } });
const count = () => prisma.user.count();

const createWithProfileAndRoles = async ({ email, passwordHash, fullName, phone, institutionName, roles }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        profile: { create: { fullName, phone, institutionName } },
      },
    });

    const roleRows = await tx.role.findMany({ where: { name: { in: roles } } });
    if (roleRows.length) {
      await tx.userRole.createMany({
        data: roleRows.map((role) => ({ userId: user.id, roleId: role.id })),
        skipDuplicates: true,
      });
    }

    return tx.user.findUnique({ where: { id: user.id }, include });
  });
};

const updateUser = async (id, data) => {
  const { fullName, phone, institutionName, roles, ...userData } = data;
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: userData });
    if (fullName || phone !== undefined || institutionName !== undefined) {
      await tx.profile.upsert({
        where: { userId: id },
        update: { fullName, phone, institutionName },
        create: { userId: id, fullName: fullName || "Sin nombre", phone, institutionName },
      });
    }
    if (roles) {
      await tx.userRole.deleteMany({ where: { userId: id } });
      const roleRows = await tx.role.findMany({ where: { name: { in: roles } } });
      await tx.userRole.createMany({
        data: roleRows.map((role) => ({ userId: id, roleId: role.id })),
        skipDuplicates: true,
      });
    }
    return tx.user.findUnique({ where: { id }, include });
  });
};

const deleteUser = (id) => prisma.user.delete({ where: { id } });
const setLastLogin = (id) => prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });

const assignRole = async (userId, roleName) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  return prisma.userRole.create({ data: { userId, roleId: role.id } });
};

const removeRole = (userId, roleId) => prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });

module.exports = {
  sanitize,
  findByEmail,
  findById,
  findMany,
  count,
  createWithProfileAndRoles,
  updateUser,
  deleteUser,
  setLastLogin,
  assignRole,
  removeRole,
};
