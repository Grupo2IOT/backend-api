const crudController = require("./controllerFactory");
const alertService = require("../services/alertService");
const { success } = require("../utils/apiResponse");

module.exports = {
  ...crudController(alertService, "Alerta"),
  resolve: async (req, res) => success(res, "Alerta resuelta", await alertService.resolve(req.params.id, req.user)),
};
