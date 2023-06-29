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
import {
  FunctionModuleCollection,
  loadFunctions,
} from "../../common/src/function/internal/loader.js";
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

  // Load functions from their source files
  const functionModules: FunctionModuleCollection = new Map();
  const loadUpdatedFunctionModules = async () => {
    const loadedFunctionModules = await loadFunctions(
      projectStructure.serverlessFunctionsRoot.path
    );
    loadedFunctionModules.forEach((functionModule) => {
      functionModules.set(functionModule.config.name, functionModule);
    });
  };

  await loadUpdatedFunctionModules(); // Load functions on initial setup

  // Assign routes for functions based on their slug when the server started
  const loadedFunctions = [...functionModules.values()];
  if (loadedFunctions.length > 0) {
    loadedFunctions.forEach((func) => {
      app.use("/" + func.slug.dev, (req, res, next) => {
        const loadedFunction = functionModules.get(func.config.name);
        if (!loadedFunction) {
          throw new Error("Could not load function with slug" + func);
        }
        serveServerlessFunction(req, res, next, loadedFunction);
      });
    });
  }

  // Reload functions if their source files change
  // Only supports updates in the default export, changes to the slug require server restart
  vite.watcher.on("change", async (filepath) => {
    if (filepath.includes("src/functions")) {
      await loadUpdatedFunctionModules();
    }
  });

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
