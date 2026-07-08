const reportService = require("../services/reportService");
const { success } = require("../utils/apiResponse");

module.exports = {
  waterUsage: async (req, res) => success(res, "Reporte de uso de agua", await reportService.waterUsage(req.user)),
  events: async (req, res) => success(res, "Reporte de eventos", await reportService.events(req.user)),
  alerts: async (req, res) => success(res, "Reporte de alertas", await reportService.alerts(req.user)),
  create: async (req, res) => success(res, "Reporte creado", await reportService.create(req.body, req.user), 201),
};
