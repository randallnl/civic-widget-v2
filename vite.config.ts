import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      name: "NHCivicCommonsVoteTracker",
      fileName: () => "vote-tracker.js",
      formats: ["iife"]
    },
    outDir: "dist/widgets",
    emptyOutDir: true
  }
});
