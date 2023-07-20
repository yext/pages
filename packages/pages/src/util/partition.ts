/**
 * Returns the partition of the provided accountId, either US or EU.
 * If the partition cannot be determined, return an empty string.
 *
 * @param accountId The accountId for which to determine the partition.
 *
 * @public
 */
export const getPartition = (accountId: number) => {
  switch (Math.floor((accountId / 100000000) % 10)) {
    case 0:
      return "US";
    case 1:
      return "EU";
    default:
      return "";
  }
};
