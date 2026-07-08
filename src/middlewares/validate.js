const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((item) => ({
    field: item.path,
    message: item.msg,
  }));
  return next(new AppError("Error de validación", 422, errors));
};
