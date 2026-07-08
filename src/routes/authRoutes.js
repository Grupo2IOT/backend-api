const router = require("express").Router();
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const v = require("../validators/commonValidators");

router.post("/register", v.register, validate, asyncHandler(authController.register));
router.post("/login", v.login, validate, asyncHandler(authController.login));
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));

module.exports = router;
