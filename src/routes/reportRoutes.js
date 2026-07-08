const router = require("express").Router();
const controller = require("../controllers/reportController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate);
router.get("/water-usage", authorize("AGRICULTOR", "SUPERVISOR", "INSTITUCION"), asyncHandler(controller.waterUsage));
router.get("/events", authorize("AGRICULTOR", "SUPERVISOR", "INSTITUCION"), asyncHandler(controller.events));
router.get("/alerts", authorize("AGRICULTOR", "SUPERVISOR", "INSTITUCION"), asyncHandler(controller.alerts));
router.post("/", authorize("AGRICULTOR", "SUPERVISOR", "INSTITUCION"), v.report, validate, asyncHandler(controller.create));

module.exports = router;
