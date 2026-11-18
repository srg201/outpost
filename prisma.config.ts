import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js keeps secrets in .env.local; load it for the Prisma CLI too.
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a session connection, not the transaction pooler. Read leniently (not with
    // env(), which throws when unset): `prisma generate` runs on every install, including CI,
    // and needs no database.
    url: process.env.DIRECT_URL ?? "",
  },
});
