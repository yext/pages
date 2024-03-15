import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import { ProjectStructure } from "../../../common/src/project/structure.js";
import send404 from "./send404.js";
import { getModuleFilepathsFromProjectStructure } from "../../../common/src/module/internal/getModuleFilepaths.js";
import { findModuleInternal } from "../ssr/findMatchingModule.js";
import serveModule from "./serveModule.js";

type Props = {
  vite: ViteDevServer;
  projectStructure: ProjectStructure;
};

export const serverRenderModule =
  ({ vite, projectStructure }: Props): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      const moduleName = req.originalUrl
        .substring(req.originalUrl.lastIndexOf("modules/") + 8)
        .toLowerCase();
      const moduleFilePaths =
        getModuleFilepathsFromProjectStructure(projectStructure);
      const moduleInternal = await findModuleInternal(
        vite,
        async (t) => moduleName === t.moduleName.toLowerCase(),
        moduleFilePaths
      );

      if (!moduleInternal) {
        send404(res, `Cannot find module for: ${moduleName}`);
        return;
      }

      await serveModule(res, moduleInternal, vite, req.originalUrl);
      return;
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };
