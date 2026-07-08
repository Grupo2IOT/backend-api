const crudController = require("./controllerFactory");
const irrigationRuleService = require("../services/irrigationRuleService");
const { success } = require("../utils/apiResponse");

module.exports = {
  ...crudController(irrigationRuleService, "Regla de riego"),
  byPlot: async (req, res) => success(res, "Regla de riego por parcela", await irrigationRuleService.byPlot(req.params.plotId, req.user)),
};
