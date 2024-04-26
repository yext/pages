/**
 * Determines if the code is being executed on the production site on
 * the client. This is useful for things like firing analytics only
 * in production (opposed to dev or staging) and not during server side
 * rendering. The domains list has been deprecated and is no longer used.
 * A client-side variable, IS_PRODUCTION, is now injected at serving time.
 *
 * @param domains - Deprecated: The specified production domains of the site
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isProduction = (...domains: string[]): boolean => {
  if (typeof window !== "undefined") {
    // Previously users would pass in the siteDomain from the document, however this lead
    // to incorrect cases where a domain is set after the deploy was made. The document
    // remains the same for the deploy, so then isProduction() would incorrectly evaluate to
    // false. Now this global var is injected at serving time, so it is always correct.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return window.IS_PRODUCTION || false;
  }

  return false;
};
