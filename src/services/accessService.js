const AppError = require("../utils/AppError");

const isAdmin = (user) => user.roles.includes("ADMIN");
const canReadAllPlots = (user) => isAdmin(user) || user.roles.includes("INSTITUCION") || user.roles.includes("TECNICO");

const plotWhereFor = (user) => {
  if (canReadAllPlots(user)) return {};
  return { OR: [{ ownerId: user.id }, { users: { some: { userId: user.id } } }] };
};

const ensureCanAccessPlot = (user, plot) => {
  if (!plot) throw new AppError("Parcela no encontrada", 404);
  if (canReadAllPlots(user) || plot.ownerId === user.id || plot.users.some((item) => item.userId === user.id)) return;
  throw new AppError("No tienes acceso a esta parcela", 403);
};

module.exports = { isAdmin, canReadAllPlots, plotWhereFor, ensureCanAccessPlot };
