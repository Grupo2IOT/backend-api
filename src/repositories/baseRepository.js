const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");

const createRepository = (modelName, defaultInclude = undefined) => {
  const model = prisma[modelName];
  const modelDefinition = Prisma.dmmf.datamodel.models.find(
    (item) => item.name.toLowerCase() === modelName.toLowerCase()
  );
  const hasCreatedAt = modelDefinition?.fields.some((field) => field.name === "createdAt");

  return {
    findMany: async (args = {}) => {
      const query = {
        take: 100,
        ...(hasCreatedAt ? { orderBy: { createdAt: "desc" } } : {}),
        ...args,
      };
      if (!Object.prototype.hasOwnProperty.call(args, "include") && defaultInclude) {
        query.include = defaultInclude;
      }
      if (query.include === null) delete query.include;
      const data = await model.findMany(query);
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
