import path, { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, Plugin } from "vite";
import serveStatic from "serve-static";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  // @ts-ignore
  const plugins: Plugin[] = [react(), tailwindcss()];
  if (isDev) {
    const devAssetsPlugin: Plugin = {
      name: "vite-plugin-dev-assets",
      configureServer(server) {
        server.middlewares.use(
          "/monopoly_s3/",
          serveStatic(path.resolve(__dirname, "monopoly_s3")),
        );
      },
    };

    plugins.push(devAssetsPlugin);
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: "/react-3d/",
    build: {
      outDir: "dist",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
        },
      },
    },
  };
});
