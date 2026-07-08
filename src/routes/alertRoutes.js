const router = require("express").Router();
const controller = require("../controllers/alertController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate);
router.get("/", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), asyncHandler(controller.list));
router.get("/:id", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.uuidParam(), validate, asyncHandler(controller.get));
router.post("/", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.createAlert, validate, asyncHandler(controller.create));
router.put("/:id", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.uuidParam(), v.alert, validate, asyncHandler(controller.update));
router.put("/:id/resolve", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.uuidParam(), validate, asyncHandler(controller.resolve));
router.delete("/:id", authorize("AGRICULTOR", "SUPERVISOR"), v.uuidParam(), validate, asyncHandler(controller.remove));

module.exports = router;
