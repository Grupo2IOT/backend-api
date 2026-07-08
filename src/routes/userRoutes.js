const router = require("express").Router();
const controller = require("../controllers/userController");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.use(authenticate, authorize("ADMIN"));
router.get("/", asyncHandler(controller.list));
router.get("/:id", v.uuidParam(), validate, asyncHandler(controller.get));
router.post("/", v.createUser, validate, asyncHandler(controller.create));
router.put("/:id", v.uuidParam(), v.user, validate, asyncHandler(controller.update));
router.delete("/:id", v.uuidParam(), validate, asyncHandler(controller.remove));
router.post("/:id/roles", v.roleAssignment, validate, asyncHandler(controller.assignRole));
router.delete("/:id/roles/:roleId", v.uuidParam(), v.uuidParam("roleId"), validate, asyncHandler(controller.removeRole));

module.exports = router;
