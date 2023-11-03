export function parseAsEntityUrl(url: URL): {
  feature: string;
  entityId: string;
} {
  const uriSegments = decodeURI(url.pathname).substring(1).split("/");
  const feature = uriSegments[0];
  const entityId = uriSegments[1];

  return {
    feature,
    entityId,
  };
}

export function parseAsStaticUrl(url: URL): { staticURL: string } {
  return {
    staticURL: decodeURI(url.pathname).substring(1),
  };
}

export function getLocaleFromUrl(url: URL): string | null {
  return url.searchParams.get("locale");
}
