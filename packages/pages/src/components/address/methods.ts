import {
  AddressType,
  ListingPublisher,
  ListingType,
  MapProvider,
} from "./types";

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

/**
 * Get a third-party maps url for a Yext location
 *
 * @param {any} profile - Partial of Yext Location entity profile
 * @param {Provider} provider - Google, Apple, Bing
 * @param {boolean} directions - Enable driving directions
 *
 * @returns {string} - Maps service url
 */
export const getDirections = (
  profile: any,
  provider?: MapProvider,
  directions?: boolean
): string | undefined => {
  // TODO: replace profile type any with partial type declaration for profile
  if (!profile.ref_listings && !profile.address) return undefined;
  const { address } = profile;

  let query = encodeArray([
    address?.line1,
    address?.line2,
    address?.city,
    address?.region,
    address?.postalCode,
    address?.countryCode,
  ]);

  switch (provider) {
    case "APPLE":
      return getDirectionsApple(query, directions);
      break;
    case "BING":
      query = encodeArray([
        address?.line1,
        address?.city,
        address?.region,
        address?.postalCode,
      ]);
      return getDirectionsBing(query, directions);
      break;
    default:
      const gmbURL = getlistingUrl(
        profile.ref_listings,
        ListingPublisher.googlemybusiness
      );
      if (gmbURL) {
        return gmbURL;
      }

      if (profile.googlePlaceId) {
        return getDirectionsGooglePlaceID(
          profile.googlePlaceId,
          query,
          directions
        );
      }

      return getDirectionsGoogle(query, directions);
  }
};

/**
 * Get Apple Maps location query
 *
 * @param {string} query - Stringified address query
 * @param {boolean} directions
 *
 * @returns {string} - Apple maps url
 */
const getDirectionsApple = (query: string, directions?: boolean): string => {
  return directions
    ? `https://maps.apple.com/?daddr=${query}`
    : `https://maps.apple.com/?address=${query}`;
};

/**
 * Get Bing Maps location query
 *
 * @param {string} query - Stringified address query
 * @param {string} directions
 *
 * @returns {string} - Bing maps url
 */
const getDirectionsBing = (query: string, directions?: boolean): string => {
  return directions
    ? `https://bing.com/maps/default.aspx?rtp=adr.${query}`
    : `https://bing.com/maps/default.aspx?where1=${query}`;
};

/**
 * Get a Google Maps Place ID page
 *
 * @param {string} placeId - Stringified address query
 * @param {string} query - Stringified address query
 * @param {boolean} directions - Enable driving directions
 * @returns {string} - Google maps url
 */
const getDirectionsGooglePlaceID = (
  placeId: string,
  query: string,
  directions?: boolean
): string => {
  return directions
    ? `https://maps.google.com/maps/dir/?api=1&destination_place_id=${placeId}&destination=direct`
    : `https://maps.google.com/maps/search/?api=1&query=${query}&query_place_id=${placeId}`;
};

/**
 * Get a Google Maps search query
 *
 * @param {string} query - Stringified address query
 * @param {boolean} directions - Enable driving directions
 * @returns {string} - Google maps url
 */
const getDirectionsGoogle = (query: string, directions?: boolean): string => {
  return directions
    ? `https://maps.google.com/maps/dir/?api=1&destination=${query}`
    : `https://maps.google.com/maps/search/?api=1&query=${query}`;
};

/**
 * Get a maps url from listings
 *
 * @param {Yext.ListingType[]} listings - Yext listings
 * @param {ListingPublisher} publisher - provider to get listing for
 * @returns {string} - url
 */
const getlistingUrl = (
  listings: ListingType[] = [],
  publisher: ListingPublisher
): string | undefined => {
  // TODO: Extract cid from URL to use in directions search
  const gmb = listings.find((l) => l.publisher === publisher);
  return gmb?.listingUrl;
};

/**
 * Convert an array of values like address parts to a url readable string
 *
 * @param {string} substrings - ordered list to encode as csv
 * @returns {string} - url friendly string
 */
const encodeArray = (substrings: string[] = []): string => {
  if (!substrings.length) return "";

  const str = substrings.filter(Boolean).join(", ");
  return encodeURI(str);
};
