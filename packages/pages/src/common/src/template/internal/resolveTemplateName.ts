export const normalizeTemplateName = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  return value.trim() || undefined;
};

export const getTemplateIdFromConfigTemplate = (value: unknown): string | undefined => {
  const normalizedTemplateName = normalizeTemplateName(value);
  if (!normalizedTemplateName) {
    return undefined;
  }

  const prefix = "visualEditorTemplates/";
  const prefixIndex = normalizedTemplateName.lastIndexOf(prefix);
  if (prefixIndex === -1) {
    return normalizedTemplateName;
  }

  return normalizeTemplateName(normalizedTemplateName.slice(prefixIndex + prefix.length));
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
    getTemplateIdFromConfigTemplate(parsedPageSet?.config?.template) ??
    normalizeTemplateName(document.__?.codeTemplate) ??
    normalizeTemplateName(document.__?.name)
  );
};
