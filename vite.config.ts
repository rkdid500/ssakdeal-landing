import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defaultServerConditions, defineConfig } from "vite";

// The server bundle runs as a Cloudflare Worker (no node_modules at runtime),
// so every dependency is bundled and resolved through edge export conditions.
// `cloudflare:*` modules are provided by the runtime and stay external.
export default defineConfig(({ command }) => ({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    ...(command === "build"
      ? {
          target: "webworker" as const,
          resolve: {
            conditions: [
              "workerd",
              "worker",
              "browser",
              ...defaultServerConditions.filter((c) => c !== "node"),
            ],
          },
        }
      : {}),
    noExternal: command === "build" ? true : undefined,
    external: ["cloudflare:workers"],
  },
  build: {
    rollupOptions: { external: [/^cloudflare:/] },
  },
  plugins: [
    // TanStack Start must run before React's plugin.
    tanstackStart({ server: { entry: "server" } }),
    react(),
    tailwindcss(),
  ],
}));
