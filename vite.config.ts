import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Default base for local dev and Netlify
    base: "/",
  };

  // Only use subpath for GitHub Pages
  // Set VITE_DEPLOY_TARGET=ghpages in the GitHub Actions workflow
  if (command !== "serve" && process.env.VITE_DEPLOY_TARGET === "ghpages") {
    config.base = "/football-tournament-manager/";
  }

  return config;
});
