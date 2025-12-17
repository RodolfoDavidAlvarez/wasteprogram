import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// NOTE:
// Vercel build (and preview deploys) may run without DATABASE_URL configured.
// PrismaClient expects a datasource URL, so we provide a safe fallback SQLite URL for build-time
// (it won't connect until a query is executed).
const datasourceUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: datasourceUrl },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
