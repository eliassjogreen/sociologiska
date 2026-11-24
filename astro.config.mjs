// @ts-check
import { defineConfig, logHandlers } from "astro/config";
import node from "@astrojs/node";
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [preact()],

  logger: logHandlers.console(),
  server: {
    host: true,
  },
});
