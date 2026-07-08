const auditService = require("../services/auditService");
const { success } = require("../utils/apiResponse");

module.exports = {
  list: async (req, res) => success(res, "Auditoría listada", await auditService.list()),
};
