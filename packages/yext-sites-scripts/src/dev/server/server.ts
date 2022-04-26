import express from "express";
import { createServer as createViteServer } from "vite";
import { serverRenderRoute } from "./middleware/serverRenderRoute.js";
import { getServerSideProps } from "./middleware/getServerSideProps.js";
import { ignoreFavicon } from "./middleware/ignoreFavicon.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import react from "@vitejs/plugin-react";

export const createServer = async (dynamicGenerateData: boolean) => {
  // creates a standard express app
  const app = express();

  // create vite using ssr mode
  const vite = await createViteServer({
    server: { middlewareMode: "ssr" },
    plugins: [react()],
    optimizeDeps: {
      // Temporary solution https://github.com/vitejs/vite/issues/6215
      include: ["react/jsx-runtime"],
      esbuildOptions: {
        // Temporary solution to allow optimized deps to access import.meta https://github.com/vitejs/vite/issues/5270
        target: "es2020",
      },
    },
  });
  // register vite's middleware
  app.use(vite.middlewares);

  // Ignore favicon requests if it doesn't exist
  app.use(ignoreFavicon);

  app.use("/data/*", getServerSideProps({ vite }));

  // when a page is requested, call our serverRenderRoute method
  app.use("*", serverRenderRoute({ vite, dynamicGenerateData }));

  app.use(errorMiddleware(vite));

  // start the server on port 3000
  app.listen(3000, () => process.stdout.write("listening on :3000\n"));
};
