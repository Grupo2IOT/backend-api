const auditRepository = require("../repositories/auditRepository");

const log = ({ userId, action, entity, entityId, description }) => {
  return auditRepository.create({ userId, action, entity, entityId, description }).catch(() => null);
};

const list = () => auditRepository.findMany();

module.exports = { log, list };
