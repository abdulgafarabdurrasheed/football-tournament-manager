import path from "path"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	if (command !== 'serve') {
    // Only add the repo name for production builds
    config.base = '/football-tournament-manager/'
  }

  return config
});
