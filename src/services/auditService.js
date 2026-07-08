const auditRepository = require("../repositories/auditRepository");

const log = async ({ userId, action, entity, entityId, description }) => {
  return await auditRepository.create({ userId, action, entity, entityId, description }).catch(() => null);
};

const list = async () => {
  return await auditRepository.findMany();
};

module.exports = { log, list };
