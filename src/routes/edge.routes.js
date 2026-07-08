const router = require("express").Router();
const { body, query } = require("express-validator");
const controller = require("../controllers/edgeController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");

router.use(authenticate);
router.get("/health", authorize("TECNICO"), asyncHandler(controller.health));
router.get(
  "/readings",
  authorize("TECNICO"),
  query("device_id").optional().isString().notEmpty(),
  query("limit").optional().isInt({ min: 1, max: 1000 }).toInt(),
  validate,
  asyncHandler(controller.readings)
);
router.post(
  "/sync",
  authorize("TECNICO"),
  body("device_id").optional().isString().notEmpty(),
  body("limit").optional().isInt({ min: 1, max: 1000 }).toInt(),
  validate,
  asyncHandler(controller.sync)
);
router.get("/status", authorize("TECNICO"), asyncHandler(controller.status));
router.get("/statistics", authorize("TECNICO"), asyncHandler(controller.statistics));

module.exports = router;
