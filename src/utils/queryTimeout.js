const AppError = require("./AppError");

const DEFAULT_TIMEOUT_MS = Number(process.env.PRISMA_QUERY_TIMEOUT_MS || 10000);

const withQueryTimeout = (promise, label, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  let timeoutId;
  const timeout = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AppError(`Timeout ejecutando consulta: ${label}`, 504));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

module.exports = { withQueryTimeout };
