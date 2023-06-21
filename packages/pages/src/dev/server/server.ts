import express from "express";
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
import fs from "fs";
import { Path } from "../../common/src/project/path.js";
import path from "path";
import { CiConfig, ServerlessFunction } from "../../common/src/ci/ci.js";
import { loadServerlessFunctionModules } from "../../common/src/function/internal/loader.js";
import { serveServerlessFunction } from "./middleware/serverlessFunctions.js";

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
  app.use(ignoreFavicon);

  // Redirect urls with a final slash to their canonical url without the slash
  app.use(finalSlashRedirect);

  let displayGenerateTestDataWarning = false;
  // Call generateTestData to ensure we have data to populate the index page.
  // If the user specifies dynamicGenerateData = false we assume they have localData already.
  if (dynamicGenerateData) {
    // display the warning if the call to generateTestData fails.
    displayGenerateTestDataWarning = !(await generateTestData(
      projectStructure.scope
    ));
  }

  const ciConfig: CiConfig = JSON.parse(
    fs.readFileSync(
      path.join(
        projectStructure.sitesConfigRoot.getAbsolutePath(),
        projectStructure.ciConfig
      ),
      "utf8"
    )
  );

  if (ciConfig.artifactStructure.functions) {
    const serverlessFunctions: ServerlessFunction[] =
      ciConfig.artifactStructure.functions;
    const loadedFunctions = await loadServerlessFunctionModules(
      serverlessFunctions.map((serverlessFunction) =>
        new Path("src/" + serverlessFunction.src).getAbsolutePath()
      ),
      true,
      false
    );
    app.use(
      serverlessFunctions.map(
        (serverlessFunction) => "/" + serverlessFunction.slug
      ),
      (req, res) => serveServerlessFunction(req, res, loadedFunctions)
    );
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
      displayGenerateTestDataWarning,
      useProdURLs,
      projectStructure,
    })
  );

  app.use(errorMiddleware(vite));

  app.listen(devServerPort, () =>
    process.stdout.write(`listening on :${devServerPort}\n`)
  );
};
