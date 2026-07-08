const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;
const connectionLimit = Number.parseInt(process.env.PRISMA_CONNECTION_LIMIT, 10);

const prismaOptions = {
  log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "error", "warn"] : ["error", "warn"],
};

if (process.env.DATABASE_URL && Number.isInteger(connectionLimit) && connectionLimit > 0) {
  const datasourceUrl = new URL(process.env.DATABASE_URL);
  datasourceUrl.searchParams.set("connection_limit", String(connectionLimit));
  prismaOptions.datasources = { db: { url: datasourceUrl.toString() } };
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
