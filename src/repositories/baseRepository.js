const prisma = require("../config/prisma");
const debugLog = require("../utils/debugLog");
const { withQueryTimeout } = require("../utils/queryTimeout");

const createRepository = (modelName, defaultInclude = undefined) => {
  const model = prisma[modelName];

  return {
    findMany: async (args = {}) => {
      const label = modelName === "device" ? "devices" : modelName === "alert" ? "alerts" : `${modelName}s`;
      console.log(`[${label}] repository start`);
      const data = await withQueryTimeout(
        model.findMany({ include: defaultInclude, ...args }),
        `${modelName}.findMany`
      );
      console.log(`[${label}] repository end`);
      return data || [];
    },
    findById: (id, args = {}) => model.findUnique({ where: { id }, include: defaultInclude, ...args }),
    create: (data, args = {}) => model.create({ data, include: defaultInclude, ...args }),
    update: (id, data, args = {}) => model.update({ where: { id }, data, include: defaultInclude, ...args }),
    delete: (id) => model.delete({ where: { id } }),
    count: (where = {}) => model.count({ where }),
  };
};

module.exports = createRepository;
