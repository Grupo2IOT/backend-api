const crudController = require("./controllerFactory");
const deviceService = require("../services/deviceService");

module.exports = crudController(deviceService, "Dispositivo");
