import { RequestHandler } from "express-serve-static-core";
import { ViteDevServer } from "vite";
import send404 from "./send404.js";
import { loadModuleInternal } from "../ssr/findMatchingModule.js";
import serveModule from "./serveModule.js";

type Props = {
  vite: ViteDevServer;
  modulePath: string;
};

export const serverRenderModule =
  ({ vite, modulePath }: Props): RequestHandler =>
  async (req, res, next): Promise<void> => {
    try {
      const moduleInternal = await loadModuleInternal(vite, modulePath);

      if (!moduleInternal) {
        const moduleName = req.originalUrl
          .substring(req.originalUrl.lastIndexOf("modules/") + 8)
          .toLowerCase();
        send404(res, `Cannot find module for: ${moduleName}`);
        return;
      }

      await serveModule(res, moduleInternal, vite, req.originalUrl);
    } catch (e: any) {
      // If an error is caught, calling next with the error will invoke
      // our error handling middleware which will then handle it.
      next(e);
    }
  };
