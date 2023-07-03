import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { serverRenderRoute } from "./middleware/serverRenderRoute.js";
import { ignoreFavicon } from "./middleware/ignoreFavicon.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { devServerPort } from "./middleware/constants.js";
import { indexPage } from "./middleware/indexPage.js";
import { generateTestData } from "./ssr/generateTestData.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { finalSlashRedirect } from "./middleware/finalSlashRedirect.js";
import { serverRenderSlugRoute } from "./middleware/serverRenderSlugRoute.js";
import { processEnvVariables } from "../../util/processEnvVariables.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as Favicon from "./public/favicon.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

export const createServer = async (
  dynamicGenerateData: boolean,
  useProdURLs: boolean,
  scope?: string
) => {
  // creates a standard express app
  const app = express();

  // initialize the default project structure and use to help configure the
  // dev server
  const projectStructure = new ProjectStructure({
    filepathsConfig: {
      scope,
    },
  });

  // create vite using ssr mode
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
    },
    appType: "custom",
    envDir: projectStructure.envVarDir,
    envPrefix: projectStructure.envVarPrefix,
    define: processEnvVariables(projectStructure.envVarPrefix),
    optimizeDeps: {
      include: ["react-dom"],
    },
  });
  // register vite's middleware
  app.use(vite.middlewares);

  // Ignore favicon requests if it doesn't exist
  app.use("/favicon.png", (req, res) => {
    const faviconRelativePath = Favicon.default.splice(3); // the import has one too many "../"
    res
      .status(200)
      .header({ "content-type": "image/png" })
      .sendFile(path.resolve(__dirname, faviconRelativePath));
  });
  app.use(ignoreFavicon);

  // Redirect urls with a final slash to their canonical url without the slash
  app.use(finalSlashRedirect);

  // Call generateTestData to ensure we have data to populate the index page.
  // If the user specifies dynamicGenerateData = false we assume they have localData already.
  if (dynamicGenerateData) {
    await generateTestData(projectStructure.scope);
  }

  // When a page is requested that is anything except the root, call our
  // serverRenderRoute middleware.
  app.use(
    /^\/(.+)/,
    useProdURLs
      ? serverRenderSlugRoute({ vite, dynamicGenerateData, projectStructure })
      : serverRenderRoute({ vite, dynamicGenerateData, projectStructure })
  );

  // Serve the index page at the root of the dev server.
  app.use(
    "/",
    indexPage({
      vite,
      dynamicGenerateData,
      useProdURLs,
      projectStructure,
    })
  );

  app.use(errorMiddleware(vite));

  app.listen(devServerPort, () =>
    process.stdout.write(`listening on :${devServerPort}\n`)
  );
};
