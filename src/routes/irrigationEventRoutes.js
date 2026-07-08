const router = require("express").Router();
const controller = require("../controllers/irrigationEventController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate, authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"));
router.get("/", asyncHandler(controller.list));
router.get("/plot/:plotId", v.uuidParam("plotId"), validate, asyncHandler(controller.byPlot));
router.get("/device/:deviceId", v.uuidParam("deviceId"), validate, asyncHandler(controller.byDevice));

module.exports = router;
