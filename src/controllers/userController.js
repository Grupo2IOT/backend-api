const userService = require("../services/userService");
const { success } = require("../utils/apiResponse");

module.exports = {
  list: async (req, res) => success(res, "Usuarios listados", await userService.list()),
  get: async (req, res) => success(res, "Usuario encontrado", await userService.get(req.params.id)),
  create: async (req, res) => success(res, "Usuario creado", await userService.create(req.body, req.user), 201),
  update: async (req, res) => success(res, "Usuario actualizado", await userService.update(req.params.id, req.body, req.user)),
  remove: async (req, res) => {
    await userService.remove(req.params.id, req.user);
    return success(res, "Usuario eliminado");
  },
  assignRole: async (req, res) => success(res, "Rol asignado", await userService.assignRole(req.params.id, req.body.role), 201),
  removeRole: async (req, res) => {
    await userService.removeRole(req.params.id, req.params.roleId);
    return success(res, "Rol removido");
  },
};
