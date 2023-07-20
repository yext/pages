/**
 * Returns the base Yext url provided a universe and a partition.
 * If the provided parameters are invalid, an empty string is returned.
 * e.g. sandbox.yext.com, yext.com, app.eu.yext.com, etc.
 *
 * @param universe The universe (dev/qa/sbx/prod) of the Yext url.
 * @param partition The partition (US/EU) of the Yext url.
 *
 * @public
 */
export const getYextUrlForPartition = (universe: string, partition: string) => {
  let urlPrefix = "";
  switch (partition) {
    case "US":
      switch (universe) {
        case "production":
        case "prod":
          break;
        case "sandbox":
        case "sbx":
          urlPrefix = "sandbox.";
          break;
        case "qa":
          urlPrefix = "qa.";
          break;
        case "dev":
          urlPrefix = "dev.";
          break;
        default:
          return "";
      }
      break;
    case "EU":
      switch (universe) {
        case "production":
        case "prod":
          urlPrefix = "app.eu.";
          break;
        case "qa":
          urlPrefix = "app-qa.eu.";
          break;
        default:
          return "";
      }
      break;
    default:
      return "";
  }
  return `${urlPrefix}yext.com`;
};
