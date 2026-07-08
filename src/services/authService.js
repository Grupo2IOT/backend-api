const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const roleRepository = require("../repositories/roleRepository");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const { ROLES } = require("../utils/constants");

const ensureBaseRoles = () =>
  roleRepository.upsertBaseRoles(
    ROLES.map((name) => ({ name, description: `Rol ${name} de AquaEdge` }))
  );

const toAuthPayload = (user) => {
  const safeUser = userRepository.sanitize(user);
  const roles = user.roles.map((userRole) => userRole.role.name);
  return {
    user: { ...safeUser, roles },
    accessToken: signAccessToken({ ...user, roles }),
    refreshToken: signRefreshToken(user),
  };
};

const register = async (payload) => {
  await ensureBaseRoles();
  const existing = await userRepository.findByEmail(payload.email);
  if (existing) throw new AppError("El email ya está registrado", 409);

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const userCount = await userRepository.count();
  const roles = userCount === 0 ? (payload.roles && payload.roles.length ? payload.roles : ["ADMIN"]) : ["AGRICULTOR"];
  const user = await userRepository.createWithProfileAndRoles({ ...payload, passwordHash, roles });
  await auditService.log({ userId: user.id, action: "register", entity: "User", entityId: user.id, description: "Registro de usuario" });
  return toAuthPayload(user);
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !user.isActive) throw new AppError("Credenciales inválidas", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Credenciales inválidas", 401);

  await userRepository.setLastLogin(user.id);
  await auditService.log({ userId: user.id, action: "login", entity: "User", entityId: user.id, description: "Inicio de sesión" });
  return toAuthPayload(user);
};

const logout = async (user) => {
  await auditService.log({ userId: user.id, action: "logout", entity: "User", entityId: user.id, description: "Cierre de sesión" });
};

module.exports = { register, login, logout, ensureBaseRoles };
