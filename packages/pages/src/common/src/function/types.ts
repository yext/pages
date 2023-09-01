/**
 * Defines the functions and fields that are available to the serverless function.
 * @public
 */
export interface FunctionModule {
  /** The exported function */
  default?: FunctionType;
}

/**
 * The valid Serverless Function types;
 * @public
 */
export type FunctionType = HttpFunction | OnUrlChangeFunction;

/**
 * A function that runs when a specific path is visited on the site.
 * @public
 */
export type HttpFunction = (arg: SitesHttpRequest) => SitesHttpResponse;

/**
 * A function that runs when the path of a production page changes.
 * @public
 */
export type OnUrlChangeFunction = (
  arg: SitesOnUrlChangeRequest
) => SitesOnUrlChangeResponse;

/**
 * The argument passed to a http/api type function.
 * @public
 */
export interface SitesHttpRequest {
  /** Object containing each query parameter. */
  queryParams: { [key: string]: string };
  /** Object containing each path parameter. */
  pathParams: { [key: string]: string };
  /** Method of the request */
  method: string;
  /** Request headers in the request */
  headers: { [key: string]: string[] };
  /** The body of the request */
  body: string;
  /** Site object containing all deploy-related information. */
  site: Site;
}

/**
 * The return value for a http/api serverless function.
 * @public
 */
export interface SitesHttpResponse {
  /** HTTP response body (refer to MDN Web Docs). */
  body: string;
  /** HTTP response status code (refer to MDN Web Docs). */
  statusCode: number;
  /** HTTP response headers (refer to MDN Web Docs).  */
  // TODO: make the value an array when the backend supports it
  headers: { [key: string]: string };
}

/**
 * The argument passed to an onUrlChange type plugin.
 * @public
 */
export interface SitesOnUrlChangeRequest {
  /** The domains the site is hosted on. */
  domainMap: {
    /** The production domain. */
    production: string;
    /** The staging domain. */
    staging: string;
    /** The preview domain. */
    deployPreview: string;
    /** The reverse proxy prefix. */
    displayUrlPrefix: string;
  };
  /** The entity's ID. */
  entityId: string;
  /** The name of the feature. */
  feature: string;
  /** The entity's locale */
  locale: string;
  /** The entity's path. */
  path: string;
  /** Site object containing all deploy-related information. */
  site: Site;
  /** The entity's new URL. */
  url: string;
  /** The entity's old URL. */
  previousUrl: string;
}

/**
 * onUrlUpdate plugins return void.
 * @public
 */
export type SitesOnUrlChangeResponse = void;

/**
 * The site information passed to a serverless function by the Yext system.
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
