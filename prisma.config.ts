import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Optional so `prisma generate` works without a database (e.g. on npm install).
  datasource: { url: process.env.DATABASE_URL },
});
