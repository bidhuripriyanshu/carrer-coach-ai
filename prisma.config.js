const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
