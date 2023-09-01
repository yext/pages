import { Request, Response, NextFunction } from "express";
import { FunctionModuleInternal } from "../../../common/src/function/internal/types.js";
import {
  SitesHttpRequest,
  Site,
  HttpFunction,
} from "../../../common/src/function/types.js";

export const serveHttpFunction = async (
  req: Request,
  res: Response,
  next: NextFunction,
  serverlessFunction: FunctionModuleInternal
) => {
  const argument: SitesHttpRequest = {
    queryParams: req.query as { [p: string]: string },
    pathParams: req.params,
    method: req.method,
    headers: req.headers as { [p: string]: string[] },
    body: req.body,
    site: mockSiteInfo,
  };

  if (serverlessFunction.default) {
    const fnRes = await (serverlessFunction.default as HttpFunction)(argument);
    res
      .status(fnRes.statusCode)
      .header({ ...fnRes.headers, "Content-Type": "application/json" })
      .send(fnRes.body);
  } else {
    next();
  }
};

export const mockSiteInfo: Site = {
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
