const plotService = require("../services/plotService");
const crudController = require("./controllerFactory");
const { success } = require("../utils/apiResponse");

module.exports = {
  ...crudController(plotService, "Parcela"),
  assignUser: async (req, res) => success(res, "Usuario asignado a parcela", await plotService.assignUser(req.params.id, req.body.userId), 201),
};
