export const REVERSE_PROXY_PREFIX_ENV_VAR = "YEXT_PAGES_REVERSE_PROXY_PREFIX";

export interface ReverseProxyOverride {
  reverseProxyPrefix: string;
  assetsDir: string;
  dynamicRoute: {
    from: string;
    to: string;
    status: number;
  };
}

/**
 * Reads and validates the reverse proxy prefix override from the build environment.
 *
 * The expected format is a host followed by a slash-delimited subpath such as
 * "www.brand.com/locations". When present, the subpath is used to derive both
 * the build assets directory and the reverse-proxy asset rewrite route.
 */
export const getReverseProxyOverride = (): ReverseProxyOverride | undefined => {
  const reverseProxyPrefix = process.env[REVERSE_PROXY_PREFIX_ENV_VAR];
  if (!reverseProxyPrefix) {
    return;
  }

  const firstSlashIndex = reverseProxyPrefix.indexOf("/");
  if (firstSlashIndex === -1) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected a host and subpath like "www.brand.com/locations".`
    );
  }

  const subpath = reverseProxyPrefix.substring(firstSlashIndex + 1);
  if (!subpath) {
    throw new Error(
      `Invalid reverseProxyPrefix "${reverseProxyPrefix}". Expected a non-empty subpath after the first slash.`
    );
  }

  return {
    reverseProxyPrefix,
    assetsDir: `${subpath}/assets`,
    dynamicRoute: {
      from: "/assets/*",
      to: `/${subpath}/assets/:splat`,
      status: 200,
    },
  };
};
