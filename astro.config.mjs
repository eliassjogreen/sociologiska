// @ts-check
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [preact()],

  i18n: {
    locales: ["sv"],
    defaultLocale: "sv",
  },

  server: {
    host: true,
  },

  env: {
    schema: {
      DATABASE: envField.string({ context: "server", access: "secret" }),
      TARGET_VERSION: envField.number({ context: "server", access: "secret", int: true }),
      APPLY_MIGRATIONS: envField.boolean({ context: "server", access: "secret" }),
      // TODO: Implement the export feature
      GOOGLE_DRIVE_EXPORT: envField.boolean({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GOOGLE_SERVICE_ACCOUNT_EMAIL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
});
