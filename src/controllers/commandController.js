const commandService = require("../services/commandService");
const { success } = require("../utils/apiResponse");

module.exports = {
  create: async (req, res) => success(res, "Comando creado", await commandService.create(req.body, req.user), 201),
  list: async (req, res) => success(res, "Comandos listados", await commandService.list(req.user)),
  pending: async (req, res) => success(res, "Comandos pendientes", await commandService.pending(req.user)),
  byDevice: async (req, res) => success(res, "Comandos por dispositivo", await commandService.byDevice(req.params.deviceId, req.user)),
  updateStatus: async (req, res) => success(res, "Estado de comando actualizado", await commandService.updateStatus(req.params.id, req.body, req.user)),
};
