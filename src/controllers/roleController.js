const roleService = require("../services/roleService");
const { success } = require("../utils/apiResponse");

module.exports = {
  list: async (req, res) => success(res, "Roles listados", await roleService.list()),
};
