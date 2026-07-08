const router = require("express").Router();
const controller = require("../controllers/irrigationRuleController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate);
router.get("/", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), asyncHandler(controller.list));
router.get("/plot/:plotId", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.uuidParam("plotId"), validate, asyncHandler(controller.byPlot));
router.post("/", authorize("AGRICULTOR", "SUPERVISOR"), v.irrigationRule, validate, asyncHandler(controller.create));
router.put("/:id", authorize("AGRICULTOR", "SUPERVISOR"), v.uuidParam(), v.irrigationRule, validate, asyncHandler(controller.update));
router.delete("/:id", authorize("AGRICULTOR", "SUPERVISOR"), v.uuidParam(), validate, asyncHandler(controller.remove));

module.exports = router;
