const router = require("express").Router();
const controller = require("../controllers/commandController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate);
router.post("/", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.command, validate, asyncHandler(controller.create));
router.get("/", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), asyncHandler(controller.list));
router.get("/pending", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), asyncHandler(controller.pending));
router.get("/device/:deviceId", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.uuidParam("deviceId"), validate, asyncHandler(controller.byDevice));
router.put("/:id/status", authorize("TECNICO"), v.commandStatus, validate, asyncHandler(controller.updateStatus));

module.exports = router;
