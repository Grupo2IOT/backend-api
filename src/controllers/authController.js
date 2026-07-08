const authService = require("../services/authService");
const userRepository = require("../repositories/userRepository");
const { success } = require("../utils/apiResponse");

const cookieOptions = { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" };

const setTokens = (res, payload) => {
  res.cookie("accessToken", payload.accessToken, cookieOptions);
  res.cookie("refreshToken", payload.refreshToken, cookieOptions);
};

const register = async (req, res) => {
  const payload = await authService.register(req.body);
  setTokens(res, payload);
  return success(res, "Usuario registrado", payload, 201);
};

const login = async (req, res) => {
  const payload = await authService.login(req.body);
  setTokens(res, payload);
  return success(res, "Inicio de sesión exitoso", payload);
};

const logout = async (req, res) => {
  await authService.logout(req.user);
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return success(res, "Cierre de sesión exitoso");
};

const me = async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  return success(res, "Usuario autenticado", userRepository.sanitize(user));
};

module.exports = { register, login, logout, me };
