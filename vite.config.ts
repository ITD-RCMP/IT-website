import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { loadEnv, type Plugin } from "vite";

const SERVER_ENV_KEYS = ["SITE_URL", "VITE_SITE_URL"] as const;

function mysqlEnvPlugin(): Plugin {
  return {
    name: "app-env",
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd(), "");
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] !== undefined) continue;
        if (
          key.startsWith("MYSQL_") ||
          key.startsWith("MICROSOFT_") ||
          SERVER_ENV_KEYS.includes(key as (typeof SERVER_ENV_KEYS)[number])
        ) {
          process.env[key] = value;
        }
      }
    },
  };
}

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    importProtection: {
      behavior: "error",
      client: {
        files: ["**/*.server.*", "**/server/**"],
        specifiers: ["server-only", "@tanstack/react-start/server"],
      },
    },
    prerender: {
      enabled: true,
      filter: ({ path }: { path: string }) =>
        path !== "/feedback" &&
        !path.startsWith("/feedback/") &&
        !path.startsWith("/admin") &&
        !path.startsWith("/auth"),
    },
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      mysqlEnvPlugin(),
      nitro({
        preset: "node-server",
        rollupConfig: {
          external: ["mysql2", "mysql2/promise"],
        },
      }),
    ],
  },
});
