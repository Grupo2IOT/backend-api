const router = require("express").Router();
const controller = require("../controllers/auditController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const asyncHandler = require("../middlewares/asyncHandler");

router.get("/", authenticate, authorize("INSTITUCION"), asyncHandler(controller.list));

module.exports = router;
