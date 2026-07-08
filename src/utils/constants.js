const ROLES = ["ADMIN", "AGRICULTOR", "SUPERVISOR", "INSTITUCION", "TECNICO"];
const COMMAND_TARGETS = ["water_pump", "fertilizer_pump"];
const COMMAND_STATES = ["ON", "OFF"];
const COMMAND_STATUSES = ["pending", "delivered", "executed", "rejected"];
const ALERT_TYPES = [
  "HUMEDAD_BAJA",
  "FERTILIDAD_BAJA",
  "TANQUE_VACIO",
  "SISTEMA_CON_PROBLEMAS",
  "DISPOSITIVO_OFFLINE",
  "CUSTOM",
];

module.exports = {
  ROLES,
  COMMAND_TARGETS,
  COMMAND_STATES,
  COMMAND_STATUSES,
  ALERT_TYPES,
};
