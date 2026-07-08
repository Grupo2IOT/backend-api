const { success } = require("../utils/apiResponse");

const crudController = (service, label) => ({
  list: async (req, res) => success(res, `${label} listados`, await service.list(req.user)),
  get: async (req, res) => success(res, `${label} encontrado`, await service.get(req.params.id, req.user)),
  create: async (req, res) => success(res, `${label} creado`, await service.create(req.body, req.user), 201),
  update: async (req, res) => success(res, `${label} actualizado`, await service.update(req.params.id, req.body, req.user)),
  remove: async (req, res) => {
    await service.remove(req.params.id, req.user);
    return success(res, `${label} eliminado`);
  },
});

module.exports = crudController;
