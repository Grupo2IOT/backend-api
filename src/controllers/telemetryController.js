const telemetryService = require("../services/telemetryService");
const { success } = require("../utils/apiResponse");

module.exports = {
  latest: async (req, res, next) => {
    try {
      const telemetry = await telemetryService.latest(req.user);
      if (res.headersSent) return;
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
