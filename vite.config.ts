import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served by GitHub Pages at https://rkdid500.github.io/ssakdeal-landing/
export default defineConfig({
  base: "/ssakdeal-landing/",
  resolve: { tsconfigPaths: true },
  plugins: [react(), tailwindcss()],
});
