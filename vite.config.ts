import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

export default defineConfig(({ mode }) => ({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: mode === "development",
  },
  plugins: [
    webExtension({
      manifest: () => {
        const base = require("./src/manifest.json");
        if (mode === "firefox") {
          return {
            ...base,
            background: {
              scripts: ["background/service-worker.ts"],
            },
            browser_specific_settings: {
              gecko: {
                id: "wait-a-sec@renzorico",
                strict_min_version: "109.0",
              },
            },
          };
        }
        return base;
      },
    }),
  ],
}));
