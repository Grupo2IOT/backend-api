const { body, param, query } = require("express-validator");
const { ROLES, COMMAND_TARGETS, COMMAND_STATES, COMMAND_STATUSES } = require("../utils/constants");

const uuidParam = (name = "id") => param(name).isUUID().withMessage(`${name} debe ser UUID`);
const optionalUuidBody = (name) => body(name).optional({ nullable: true }).isUUID().withMessage(`${name} debe ser UUID`);
const positiveNumber = (name) => body(name).optional({ nullable: true }).isFloat({ min: 0 }).withMessage(`${name} debe ser positivo`);
const positiveInt = (name) => body(name).optional({ nullable: true }).isInt({ min: 1 }).withMessage(`${name} debe ser entero positivo`);

const pagination = [
  query("limit").optional().isInt({ min: 1, max: 200 }).toInt(),
  query("page").optional().isInt({ min: 1 }).toInt(),
];

const register = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("password debe tener al menos 8 caracteres"),
  body("fullName").notEmpty().withMessage("fullName es requerido"),
  body("roles").optional().isArray(),
  body("roles.*").optional().isIn(ROLES).withMessage("rol inválido"),
];

const login = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("password es requerido"),
];

const createUser = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("fullName").notEmpty(),
  body("roles").optional().isArray(),
  body("roles.*").optional().isIn(ROLES),
];

const user = [
  body("email").optional().isEmail().normalizeEmail(),
  body("password").optional().isLength({ min: 8 }),
  body("isActive").optional().isBoolean(),
  body("fullName").optional().notEmpty(),
  body("roles").optional().isArray(),
  body("roles.*").optional().isIn(ROLES),
];

const roleAssignment = [uuidParam(), body("role").isIn(ROLES).withMessage("rol inválido")];

const createPlot = [
  body("name").notEmpty(),
  body("ownerId").optional().isUUID(),
  positiveNumber("area"),
];

const plot = [
  body("name").optional().notEmpty(),
  body("ownerId").optional().isUUID(),
  positiveNumber("area"),
];

const assignUserToPlot = [uuidParam(), body("userId").isUUID().withMessage("userId debe ser UUID")];

const createDevice = [
  body("deviceCode").notEmpty(),
  body("deviceName").notEmpty(),
  body("plotId").isUUID(),
  body("status").optional().isIn(["ONLINE", "OFFLINE", "MAINTENANCE"]),
];

const device = [
  body("deviceCode").optional().notEmpty(),
  body("deviceName").optional().notEmpty(),
  body("plotId").optional().isUUID(),
  body("status").optional().isIn(["ONLINE", "OFFLINE", "MAINTENANCE"]),
];

const command = [
  body("deviceId").isUUID(),
  body("target").isIn(COMMAND_TARGETS),
  body("state").isIn(COMMAND_STATES),
  positiveInt("durationSec"),
];

const commandStatus = [
  uuidParam(),
  body("status").isIn(COMMAND_STATUSES),
  body("deliveredAt").optional().isISO8601(),
  body("executedAt").optional().isISO8601(),
];

const irrigationRule = [
  body("plotId").optional().isUUID(),
  body("minSoilMoisture").isFloat({ min: 0, max: 100 }),
  body("maxSoilMoisture").isFloat({ min: 0, max: 100 }),
  body("autoIrrigationEnabled").optional().isBoolean(),
  positiveInt("readingIntervalSec"),
];

const createAlert = [
  body("plotId").isUUID(),
  optionalUuidBody("deviceId"),
  body("type").isIn(["HUMEDAD_BAJA", "FERTILIDAD_BAJA", "TANQUE_VACIO", "SISTEMA_CON_PROBLEMAS", "DISPOSITIVO_OFFLINE", "CUSTOM"]),
  body("severity").isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  body("title").notEmpty(),
  body("message").notEmpty(),
];

const alert = [
  body("plotId").optional().isUUID(),
  optionalUuidBody("deviceId"),
  body("type").optional().isIn(["HUMEDAD_BAJA", "FERTILIDAD_BAJA", "TANQUE_VACIO", "SISTEMA_CON_PROBLEMAS", "DISPOSITIVO_OFFLINE", "CUSTOM"]),
  body("severity").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  body("title").optional().notEmpty(),
  body("message").optional().notEmpty(),
  body("status").optional().isIn(["open", "resolved"]),
];

const report = [
  optionalUuidBody("userId"),
  optionalUuidBody("plotId"),
  body("type").notEmpty(),
  body("periodStart").isISO8601(),
  body("periodEnd").isISO8601(),
  body("metadata").optional().isObject(),
];

module.exports = {
  uuidParam,
  pagination,
  register,
  login,
  createUser,
  user,
  roleAssignment,
  createPlot,
  plot,
  assignUserToPlot,
  createDevice,
  device,
  command,
  commandStatus,
  irrigationRule,
  createAlert,
  alert,
  report,
};
