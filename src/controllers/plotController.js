const plotService = require("../services/plotService");
const { success } = require("../utils/apiResponse");

module.exports = {
  list: async (req, res, next) => {
    try {
      const data = await plotService.list(req.user);
      if (res.headersSent) return;
      return res.status(200).json({
        success: true,
        message: "Plots retrieved successfully",
        data: data || [],
      });
    } catch (error) {
      return next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const data = await plotService.get(req.params.id, req.user);
      return res.status(200).json({ success: true, message: "Plot retrieved successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const data = await plotService.create(req.body, req.user);
      return res.status(201).json({ success: true, message: "Plot created successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await plotService.update(req.params.id, req.body, req.user);
      return res.status(200).json({ success: true, message: "Plot updated successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      await plotService.remove(req.params.id, req.user);
      return res.status(200).json({ success: true, message: "Plot deleted successfully", data: null });
    } catch (error) {
      return next(error);
    }
  },
  assignUser: async (req, res, next) => {
    try {
      const data = await plotService.assignUser(req.params.id, req.body.userId);
      return success(res, "Usuario asignado a parcela", data, 201);
    } catch (error) {
      return next(error);
    }
  },
};
