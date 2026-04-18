import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  publicDir: "public/vivaldi",
  build: {
    minify: false,
    outDir: "dist/vivaldi",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        vivaldi: resolve("src", "vivaldi", "main.ts"),
      },
      output: {
        entryFileNames: "custom.js",
        assetFileNames: "custom.[ext]",
      },
    },
  },
});
