const createRepository = require("./baseRepository");

module.exports = createRepository("irrigationEvent", { plot: true, device: true, command: true });
