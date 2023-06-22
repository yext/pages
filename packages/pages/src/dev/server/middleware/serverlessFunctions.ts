import { Request, Response } from "express";
import { ServerlessFunctionModuleInternal } from "../../../common/src/function/internal/types.js";
import {
  ServerlessFunctionArgument,
  Site,
} from "../../../common/src/function/types.js";

export const serveServerlessFunction = async (
  req: Request,
  res: Response,
  serverlessFunction: ServerlessFunctionModuleInternal<ServerlessFunctionArgument>
) => {
  const argument: ServerlessFunctionArgument = {
    queryParams: req.query as { [p: string]: string },
    pathParams: req.params,
    site: mockSiteInfo,
  };

  const fnRes = serverlessFunction.default(argument);
  res.status(fnRes.statusCode).header(fnRes.headers).send(fnRes.body);
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
