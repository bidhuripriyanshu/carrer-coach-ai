require("dotenv").config();
const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  migrate: {
    url: process.env.DATABASE_URL,
  },
});
