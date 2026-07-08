const createRepository = require("./baseRepository");

module.exports = createRepository("pendingCommand", { device: { include: { plot: true } } });
