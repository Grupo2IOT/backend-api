const telemetryService = require("../services/telemetryService");
const { success } = require("../utils/apiResponse");
const debugLog = require("../utils/debugLog");

module.exports = {
  latest: async (req, res, next) => {
    console.log("[telemetry/latest] controller start");
    try {
      const telemetry = await telemetryService.latest(req.user);
      if (res.headersSent) return;
      console.log("[telemetry/latest] response sent");
      if (!telemetry) {
        return res.status(200).json({
          success: true,
          message: "No telemetry available",
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Latest telemetry retrieved successfully",
        data: telemetry,
      });
    } catch (error) {
      return next(error);
    }
  },
  history: async (req, res) => success(res, "Historial de telemetría", await telemetryService.history(req.user)),
  byDevice: async (req, res) => success(res, "Telemetría por dispositivo", await telemetryService.byDevice(req.params.deviceId, req.user)),
  byPlot: async (req, res) => success(res, "Telemetría por parcela", await telemetryService.byPlot(req.params.plotId, req.user)),
};
