const router = require("express").Router();
const controller = require("../controllers/roleController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const asyncHandler = require("../middlewares/asyncHandler");

router.get("/", authenticate, authorize("ADMIN"), asyncHandler(controller.list));

module.exports = router;
