export const validateGetPathValue = (value: unknown, templateIdentifier: string) => {
  if (!value || typeof value !== "string") {
    throw new Error(`getPath does not return a valid string in template '${templateIdentifier}'`);
  }
};
