const normalizeTemplateName = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  return value.trim() || undefined;
};

export const getDocumentTemplateName = (document: Record<string, any>): string | undefined => {
  const pageSet = document._pageset;
  const parsedPageSet =
    typeof pageSet === "string"
      ? (() => {
          try {
            return JSON.parse(pageSet);
          } catch {
            return undefined;
          }
        })()
      : pageSet;

  return (
    normalizeTemplateName(parsedPageSet?.config?.template) ??
    normalizeTemplateName(document.__?.codeTemplate) ??
    normalizeTemplateName(document.__?.name)
  );
};
