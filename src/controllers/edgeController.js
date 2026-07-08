const edgeApiService = require("../services/edgeApiService");
const edgeSyncService = require("../services/edgeSyncService");
const { success } = require("../utils/apiResponse");

module.exports = {
  health: async (req, res) => {
    const response = await edgeApiService.health();
    return success(res, "Edge API health retrieved successfully", response.data);
  },
  readings: async (req, res) => {
    const response = await edgeApiService.readings({
      deviceId: req.query.device_id,
      limit: req.query.limit,
    });
    return success(res, "Edge readings retrieved successfully", response.data);
  },
  sync: async (req, res) =>
    success(
      res,
      "Edge readings synchronized successfully",
      await edgeSyncService.sync({
        deviceId: req.body.device_id,
        limit: req.body.limit,
      })
    ),
  status: async (req, res) =>
    success(res, "Edge integration status retrieved successfully", edgeSyncService.status()),
  statistics: async (req, res) =>
    success(
      res,
      "Edge integration statistics retrieved successfully",
      await edgeSyncService.statistics()
    ),
};
