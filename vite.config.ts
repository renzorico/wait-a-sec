import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import path from "path";

export default defineConfig(({ mode }) => ({
  // Set root to src/ so manifest-relative paths resolve correctly
  root: path.resolve(__dirname, "src"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
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
