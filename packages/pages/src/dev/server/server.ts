import express from "express";
import { createServer as createViteServer } from "vite";
import { serverRenderRoute } from "./middleware/serverRenderRoute.js";
import { ignoreFavicon } from "./middleware/ignoreFavicon.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { viteDevServerPort } from "./middleware/constants.js";
import { indexPage } from "./middleware/indexPage.js";
import { generateTestData } from "./ssr/generateTestData.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { finalSlashRedirect } from "./middleware/finalSlashRedirect.js";

export const createServer = async (dynamicGenerateData: boolean) => {
  // creates a standard express app
  const app = express();

  // initialize the default project structure and use to help configure the
  // dev server
  const projectStructure = new ProjectStructure();

  // create vite using ssr mode
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    envDir: projectStructure.envVarDir,
    envPrefix: projectStructure.envVarPrefix,
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

  // Redirect urls with a final slash to their canonical url without the slash
  // app.use(finalSlashRedirect);
  
  // When a page is requested that is anything except the root, call our
  // serverRenderRoute middleware.
  app.use(
    /^\/(.+)/,
    serverRenderRoute({ vite, dynamicGenerateData, projectStructure })
  );

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
