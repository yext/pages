import { Request, Response } from "express";
import { ServerlessFunctionModuleCollection } from "../../../common/src/function/internal/loader.js";
import {
  ServerlessFunctionArgument,
  Site,
} from "../../../common/src/function/types.js";

export const serveServerlessFunction = async (
  req: Request,
  res: Response,
  loadedFunctions: ServerlessFunctionModuleCollection
) => {
  const serverlessFunction = loadedFunctions.get(req.baseUrl.slice(1));

  if (serverlessFunction && serverlessFunction.default) {
    const argument: ServerlessFunctionArgument = {
      queryParams: Object(req),
      pathParams: {},
      site: mockSiteInfo,
    };

    const fnRes = serverlessFunction.default(argument);
    res.status(fnRes.statusCode).header(fnRes.headers).send(fnRes.body);
  }
  res.status(404).send();
};

const mockSiteInfo: Site = {
  branchId: "mock-branch-id",
  businessId: "000000",
  businessName: "mock-dev-server-busines",
  commitHash: "aaaaaa",
  commitMessage: "mock commit message",
  deployId: "00",
  displayUrlPrefix: "url-prefix",
  invocationContext: "local",
  partnerId: "000",
  platformUrl: "platform-url",
  previewDomain: "preview-url",
  productionDomain: "production-url",
  repoBranchName: "master",
  repoBranchUrl: "https://github.com/user/repo/tree/main",
  repoUrl: "https://github.com/user/repo",
  siteId: "123456",
  siteName: "Mock Site Name",
  stagingDomain: "staging-url",
  yextUniverse: "development",
};
