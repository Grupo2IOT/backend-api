const router = require("express").Router();
const controller = require("../controllers/telemetryController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate, authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"));
router.get("/latest", asyncHandler(controller.latest));
router.get("/history", asyncHandler(controller.history));
router.get("/device/:deviceId", v.uuidParam("deviceId"), validate, asyncHandler(controller.byDevice));
router.get("/plot/:plotId", v.uuidParam("plotId"), validate, asyncHandler(controller.byPlot));

module.exports = router;
