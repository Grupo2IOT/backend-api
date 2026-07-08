const router = require("express").Router();
const controller = require("../controllers/deviceController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate);
router.get("/", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), asyncHandler(controller.list));
router.get("/:id", authorize("AGRICULTOR", "SUPERVISOR", "TECNICO"), v.uuidParam(), validate, asyncHandler(controller.get));
router.post("/", authorize("TECNICO"), v.createDevice, validate, asyncHandler(controller.create));
router.put("/:id", authorize("TECNICO"), v.uuidParam(), v.device, validate, asyncHandler(controller.update));
router.delete("/:id", authorize("TECNICO"), v.uuidParam(), validate, asyncHandler(controller.remove));

module.exports = router;
