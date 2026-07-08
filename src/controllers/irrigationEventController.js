const irrigationEventService = require("../services/irrigationEventService");
const { success } = require("../utils/apiResponse");

module.exports = {
  list: async (req, res) => success(res, "Eventos de riego listados", await irrigationEventService.list(req.user)),
  byPlot: async (req, res) => success(res, "Eventos por parcela", await irrigationEventService.byPlot(req.params.plotId, req.user)),
  byDevice: async (req, res) => success(res, "Eventos por dispositivo", await irrigationEventService.byDevice(req.params.deviceId, req.user)),
};
