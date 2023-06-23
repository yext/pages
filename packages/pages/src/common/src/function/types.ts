/**
 * Defines the functions and fields that are available to the serverless function.
 * @public
 */
export interface FunctionModule {
  /** The exported config function */
  config?: FunctionConfig;
  /** The exported getPath function */
  getPath?: () => string;
  /** The exported function */
  default?: ServerlessFunction;
}

/**
 * The type definition for serverless function itself.
 * @public
 */
export type ServerlessFunction = (arg: FunctionArgument) => FunctionReturnValue;

/**
 * The exported `config` function's definition.
 * @public
 */
export interface FunctionConfig {
  /** The name of the serverless function. */
  name?: string;
}

/**
 * The standard return value for a serverless function
 * @public
 */
export interface FunctionReturnValue {
  /** HTTP response body (refer to MDN Web Docs). */
  body: string;

  /** HTTP response status code (refer to MDN Web Docs). */
  statusCode: number;

  /** HTTP response headers (refer to MDN Web Docs).  */
  headers: object;
}

/**
 * The argument passed to a serverless function
 * @public
 */
export interface FunctionArgument {
  /** Object containing each query parameter. */
  queryParams: { [key: string]: string };

  /** Object containing each path parameter. */
  pathParams: { [key: string]: string };

  /** Site object containing all deploy-related information. */
  site: Site;
}

/**
 * The site information passed to a serverless function by the Yext system
 * @public
 */
export interface Site {
  /** Internal ID of the site branch. */
  branchId: string;

  /** Internal ID of the Yext account. */
  businessId: string;

  /** Display name of the Yext account. */
  businessName: string;

  /** The Git commit hash associated with the deploy. */
  commitHash: string;

  /** The Git commit message associated with the deploy. */
  commitMessage: string;

  /** Internal ID for the deploy. */
  deployId: string;

  /** The "base URL" used for reverse proxying, as specified in serving.json. */
  displayUrlPrefix: string;

  /** Environment in which a request is invoked. */
  invocationContext: "local" | "preview" | "staging" | "production" | null;

  /** External ID of the Yext account. */
  partnerId: string;

  /** URL of the deploy in the Yext platform. */
  platformUrl: string;

  /** URL of preview domain associated with the deploy. */
  previewDomain: string;

  /** URL of production domain associated with the deploy. */
  productionDomain: string;

  /** Name of the GitHub branch associated with the deploy. */
  repoBranchName: string;

  /** URL of the GitHub branch associated with the site. */
  repoBranchUrl: string;

  /** URL of the GitHub repo associated with the site. */
  repoUrl: string;

  /** Internal ID of the site. */
  siteId: string;

  /** Display name of the site. */
  siteName: string;

  /** URL of staging domain associated with the deploy. */
  stagingDomain: string;

  /** Universe of the Yext account. */
  yextUniverse: "development" | "qa" | "sandbox" | "production" | null;
}
