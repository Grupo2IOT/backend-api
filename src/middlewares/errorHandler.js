const { Prisma } = require("@prisma/client");
const { error } = require("../utils/apiResponse");

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return error(res, "Conflicto de datos únicos", [{ field: err.meta && err.meta.target }], 409);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return error(res, "Datos inválidos", [], 422);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Error interno del servidor" : err.message;
  return error(res, message, err.errors || [], statusCode);
};
