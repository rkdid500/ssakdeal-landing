import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served by GitHub Pages at https://rkdid500.github.io/ssakdeal-landing/
//  - /            시안 2
//  - /final/      최종 믹스 버전 (외부 라이브러리 없는 React)
export default defineConfig({
  base: "/ssakdeal-landing/",
  resolve: { tsconfigPaths: true },
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        final: "final/index.html",
      },
    },
  },
});
