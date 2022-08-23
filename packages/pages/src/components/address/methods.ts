import { AddressType } from "./types";

/**
 * Get the unabbreviated version of a field if available
 *
 * getUnabbreviated('countryCode', address) ==> 'United States'
 *
 * @param field an address field name
 * @param address a Yext address
 * @returns the unabbreviated version of the field
 */
export const getUnabbreviated = (
  field: keyof AddressType,
  address: AddressType
): string | undefined => {
  const abbrFields: { [k: string]: keyof AddressType } = {
    region: "localizedRegionName",
    countryCode: "localizedCountryName",
  };

  const unabbreviatedField = abbrFields[field];

  return unabbreviatedField && address[unabbreviatedField];
};
