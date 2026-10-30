// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
process.env.NODE_ENV = process.env.NODE_ENV || "production";

import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  react: {
    jsxRuntime: "automatic",
    development: false,
  },
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
  },
  nitro: {
    output: {
      dir: "dist",
      publicDir: "dist",
      serverDir: "dist/server",
    },
    hooks: {
      compiled() {
        try {
          const distDir = path.resolve(process.cwd(), "dist");
          const shellFile = path.join(distDir, "_shell.html");
          const indexFile = path.join(distDir, "index.html");
          const fallback404 = path.join(distDir, "404.html");
          if (fs.existsSync(shellFile)) {
            fs.copyFileSync(shellFile, indexFile);
            fs.copyFileSync(shellFile, fallback404);
            console.log("[build] Created dist/index.html and dist/404.html from _shell.html");
          }
        } catch (err) {
          console.warn("[build] Could not copy _shell.html to index.html:", err);
        }
      },
    },
  },
});
