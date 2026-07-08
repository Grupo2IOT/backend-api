const router = require("express").Router();
const controller = require("../controllers/plotController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate);
router.get("/", authorize("AGRICULTOR", "SUPERVISOR", "INSTITUCION", "TECNICO"), asyncHandler(controller.list));
router.get("/:id", authorize("AGRICULTOR", "SUPERVISOR", "INSTITUCION", "TECNICO"), v.uuidParam(), validate, asyncHandler(controller.get));
router.post("/", authorize("AGRICULTOR", "SUPERVISOR"), v.createPlot, validate, asyncHandler(controller.create));
router.put("/:id", authorize("AGRICULTOR", "SUPERVISOR"), v.uuidParam(), v.plot, validate, asyncHandler(controller.update));
router.delete("/:id", authorize("AGRICULTOR", "SUPERVISOR"), v.uuidParam(), validate, asyncHandler(controller.remove));
router.post("/:id/assign-user", authorize("ADMIN", "SUPERVISOR"), v.assignUserToPlot, validate, asyncHandler(controller.assignUser));

module.exports = router;
