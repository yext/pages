import express from "express";
import { createServer as createViteServer } from "vite";
import { serverRenderRoute } from "./middleware/serverRenderRoute.js";
import { ignoreFavicon } from "./middleware/ignoreFavicon.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { viteDevServerPort } from "./middleware/constants.js";
import { indexPage } from "./middleware/indexPage.js";
import { generateTestData } from "./ssr/generateTestData.js";
import { ProjectStructure } from "../../../../common/src/project/structure.js";

export const createServer = async (dynamicGenerateData: boolean) => {
  // creates a standard express app
  const app = express();

  // initialize the default project structure and use to help configure the
  // dev server
  const projectStructure = new ProjectStructure();

  // create vite using ssr mode
  const vite = await createViteServer({
    server: { middlewareMode: "ssr" },
    envDir: projectStructure.envVarDir,
    envPrefix: projectStructure.envVarPrefix,
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

  let displayGenerateTestDataWarning = false;
  if (dynamicGenerateData) {
    // display the warning if the call to generateTestData fails.
    displayGenerateTestDataWarning = !(await generateTestData());
  }

  // When a page is requested that is anything except the root, call our
  // serverRenderRoute middleware.
  app.use(/^\/(.+)/, serverRenderRoute({ vite, dynamicGenerateData, projectStructure }));

  // Serve the index page at the root of the dev server.
  app.use(
    "/",
    indexPage({ dynamicGenerateData, displayGenerateTestDataWarning })
  );

  app.use(errorMiddleware(vite));

  // start the server on port 3000
  app.listen(viteDevServerPort, () =>
    process.stdout.write(`listening on :${viteDevServerPort}\n`)
  );
};
