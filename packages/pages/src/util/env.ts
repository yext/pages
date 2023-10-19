import { getRuntime } from "./runtime.js";

/**
 * Determines if the code is being executed on the production site on
 * the client. This is useful for things like firing analytics only
 * in production (opposed to dev or staging) and not during server side
 * rendering. If one or more domains are provided, the current hostname
 * must match one of them in order to be considered a production domain.
 * If no domains are provided, all hostnames are considered production
 * domains except for localhost and preview.pagescdn.com.
 *
 * @param domains The specified production domains of the site
 *
 * @public
 */
export const isProduction = (...domains: string[]): boolean => {
  const runtime = getRuntime();
  if (runtime.name !== "browser") {
    return false;
  }

  const currentHostname: string = window?.location?.hostname;

  if (domains.length === 0) {
    return (
      currentHostname !== "localhost" &&
      !currentHostname.includes("preview.pagescdn.com")
    );
  }

  return domains.some((domain) => domain?.includes(currentHostname));
};
