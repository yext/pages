import { Request, Response } from "express";
import { ServerlessFunctionModuleCollection } from "../../../common/src/function/internal/loader.js";

export const serveServerlessFunction = async (
  req: Request,
  res: Response,
  loadedFunctions: ServerlessFunctionModuleCollection
) => {
  const serverlessFunction = loadedFunctions.get(req.baseUrl.slice(1));

  if (serverlessFunction && serverlessFunction.default) {
    const fnRes = serverlessFunction.default(req);
    res.status(fnRes.statusCode).header(fnRes.headers).send(fnRes.body);
  }
  res.status(404).send();
};
