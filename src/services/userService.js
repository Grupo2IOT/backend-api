const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const auditService = require("./auditService");
const AppError = require("../utils/AppError");

const list = async () => (await userRepository.findMany()).map(userRepository.sanitize);
const get = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new AppError("Usuario no encontrado", 404);
  return userRepository.sanitize(user);
};

const create = async (payload, actor) => {
  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await userRepository.createWithProfileAndRoles({
    ...payload,
    passwordHash,
    roles: payload.roles && payload.roles.length ? payload.roles : ["AGRICULTOR"],
  });
  await auditService.log({ userId: actor.id, action: "create_user", entity: "User", entityId: user.id, description: "Crear usuario" });
  return userRepository.sanitize(user);
};

const update = async (id, payload, actor) => {
  const data = { ...payload };
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 12);
    delete data.password;
  }
  const user = await userRepository.updateUser(id, data);
  await auditService.log({ userId: actor.id, action: "update_user", entity: "User", entityId: id, description: "Editar usuario" });
  return userRepository.sanitize(user);
};

const remove = async (id, actor) => {
  await userRepository.deleteUser(id);
  await auditService.log({ userId: actor.id, action: "delete_user", entity: "User", entityId: id, description: "Eliminar usuario" });
};

const assignRole = async (userId, role) => {
  return await userRepository.assignRole(userId, role);
};

const removeRole = async (userId, roleId) => {
  return await userRepository.removeRole(userId, roleId);
};

module.exports = { list, get, create, update, remove, assignRole, removeRole };
