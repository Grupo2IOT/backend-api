const jwt = require("jsonwebtoken");
const env = require("../config/env");
const AppError = require("../utils/AppError");

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies.accessToken;
    if (!token) throw new AppError("Token requerido", 401);

    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload.sub || !Array.isArray(payload.roles)) {
      throw new AppError("Token inválido", 401);
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
    return next();
  } catch (err) {
    return next(err.isOperational ? err : new AppError("Token inválido o expirado", 401));
  }
};
