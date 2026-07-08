const telemetryService = require("../services/telemetryService");
const { success } = require("../utils/apiResponse");

module.exports = {
  latest: async (req, res) => success(res, "Telemetría reciente", await telemetryService.latest(req.user)),
  history: async (req, res) => success(res, "Historial de telemetría", await telemetryService.history(req.user)),
  byDevice: async (req, res) => success(res, "Telemetría por dispositivo", await telemetryService.byDevice(req.params.deviceId, req.user)),
  byPlot: async (req, res) => success(res, "Telemetría por parcela", await telemetryService.byPlot(req.params.plotId, req.user)),
};
