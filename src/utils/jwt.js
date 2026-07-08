const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signAccessToken = (user) => {
  return jwt.sign({ sub: user.id, email: user.email, roles: user.roles || [] }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

const signRefreshToken = (user) => {
  return jwt.sign({ sub: user.id, type: "refresh" }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
};

module.exports = { signAccessToken, signRefreshToken };
