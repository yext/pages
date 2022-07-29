export const urlToFeature = (
  url: URL
): { feature: string; entityId: string; locale: string } => {
  // URI decode and remove leading slash: /foo/123
  const uriSegments = decodeURI(url.pathname).substring(1).split("/");
  const feature = uriSegments[0];
  const entityId = uriSegments[1];

  const locale = url.searchParams.get("locale") || "en";

  return {
    feature,
    entityId,
    locale,
  };
};
