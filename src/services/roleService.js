const roleRepository = require("../repositories/roleRepository");
const { ensureBaseRoles } = require("./authService");

const list = async () => {
  await ensureBaseRoles();
  return await roleRepository.findMany();
};

module.exports = { list };
