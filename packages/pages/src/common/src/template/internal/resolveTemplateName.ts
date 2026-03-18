const getPageSetTemplateNameFromDocument = (document: Record<string, any>): string | undefined => {
  const pageSet = document._pageset;
  if (!pageSet) {
    return undefined;
  }

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

  return parsedPageSet?.config?.template;
};

export const getDocumentTemplateName = (document: Record<string, any>): string | undefined => {
  return (
    getPageSetTemplateNameFromDocument(document) ?? document.__?.codeTemplate ?? document.__?.name
  );
};

export const hasDocumentTemplateMetadata = (document: Record<string, any>): boolean => {
  return Boolean(getPageSetTemplateNameFromDocument(document) ?? document.__?.codeTemplate);
};
