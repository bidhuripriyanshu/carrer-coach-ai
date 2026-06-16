import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;

  // Recreate client when the cached instance is missing new models.
  // Check for "feedback" — the latest model added to the schema.
  // If a future model is added, update this check accordingly.
  if (cached && typeof cached.feedback !== "undefined") {
    return cached;
  }

  // Clear stale reference so the new client is stored correctly
  globalForPrisma.prisma = undefined;

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getPrismaClient();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
