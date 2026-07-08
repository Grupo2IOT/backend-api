const AppError = require("../utils/AppError");

module.exports = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError("Autenticación requerida", 401));
  if (req.user.roles.includes("ADMIN")) return next();
  if (roles.some((role) => req.user.roles.includes(role))) return next();
  return next(new AppError("No tienes permisos para esta acción", 403));
};
