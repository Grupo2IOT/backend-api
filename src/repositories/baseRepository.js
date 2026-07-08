const prisma = require("../config/prisma");

const createRepository = (modelName, defaultInclude = undefined) => {
  const model = prisma[modelName];

  return {
    findMany: (args = {}) => model.findMany({ include: defaultInclude, ...args }),
    findById: (id, args = {}) => model.findUnique({ where: { id }, include: defaultInclude, ...args }),
    create: (data, args = {}) => model.create({ data, include: defaultInclude, ...args }),
    update: (id, data, args = {}) => model.update({ where: { id }, data, include: defaultInclude, ...args }),
    delete: (id) => model.delete({ where: { id } }),
    count: (where = {}) => model.count({ where }),
  };
};

module.exports = createRepository;
