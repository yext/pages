/**
 * A custom import function so that it can be mocked in tests.
 */
export const import_ = async (filepath: string) => {
  return await import(filepath);
};
