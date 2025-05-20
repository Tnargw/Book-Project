import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        apiTest: resolve(__dirname, "src/Playground/recommendations/apiTest.html"),
        apiTestGenreSpecific: resolve(__dirname, "src/Playground/recommendations/apiTestGenreSpecific.html"),
        rainbowCanvas: resolve(__dirname, "src/Playground/interact-js-rainbow-pixel-canvas/draw/index.html")
      }
    }
  }
});
