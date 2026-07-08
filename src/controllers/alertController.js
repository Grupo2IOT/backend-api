const alertService = require("../services/alertService");
const { success } = require("../utils/apiResponse");

module.exports = {
  list: async (req, res, next) => {
    try {
      const data = await alertService.list(req.user);
      if (res.headersSent) return;
      return res.status(200).json({
        success: true,
        message: "Alerts retrieved successfully",
        data: data || [],
      });
    } catch (error) {
      return next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const data = await alertService.get(req.params.id, req.user);
      return res.status(200).json({ success: true, message: "Alert retrieved successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const data = await alertService.create(req.body, req.user);
      return res.status(201).json({ success: true, message: "Alert created successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await alertService.update(req.params.id, req.body, req.user);
      return res.status(200).json({ success: true, message: "Alert updated successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  resolve: async (req, res, next) => {
    try {
      const data = await alertService.resolve(req.params.id, req.user);
      return success(res, "Alerta resuelta", data);
    } catch (error) {
      return next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      await alertService.remove(req.params.id, req.user);
      return res.status(200).json({ success: true, message: "Alert deleted successfully", data: null });
    } catch (error) {
      return next(error);
    }
  },
};
