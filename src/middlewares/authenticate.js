const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/AppError");

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies.accessToken;
    if (!token) throw new AppError("Token requerido", 401);

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw new AppError("Usuario no autorizado", 401);

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map((userRole) => userRole.role.name),
    };
    next();
  } catch (err) {
    next(err.isOperational ? err : new AppError("Token inválido o expirado", 401));
  }
};
