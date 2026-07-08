const deviceService = require("../services/deviceService");

module.exports = {
  list: async (req, res, next) => {
    console.log("[devices] controller start");
    try {
      const data = await deviceService.list(req.user);
      if (res.headersSent) return;
      console.log("[devices] response sent");
      return res.status(200).json({
        success: true,
        message: "Devices retrieved successfully",
        data: data || [],
      });
    } catch (error) {
      return next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const data = await deviceService.get(req.params.id, req.user);
      return res.status(200).json({ success: true, message: "Device retrieved successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const data = await deviceService.create(req.body, req.user);
      return res.status(201).json({ success: true, message: "Device created successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await deviceService.update(req.params.id, req.body, req.user);
      return res.status(200).json({ success: true, message: "Device updated successfully", data });
    } catch (error) {
      return next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      await deviceService.remove(req.params.id, req.user);
      return res.status(200).json({ success: true, message: "Device deleted successfully", data: null });
    } catch (error) {
      return next(error);
    }
  },
};
