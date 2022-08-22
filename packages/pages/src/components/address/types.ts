/**
 * The type definition for an address.
 *
 * @public
 */
export interface AddressType {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  region?: string;
  postalCode: string;
  countryCode: string;
  sublocality?: string;
  extraDescription?: string;
  localizedRegionName?: string; // previously in derived data
  localizedCountryName?: string; // previously in derived data
}

export type AddressLine = (keyof AddressType | ",")[];

/**
 * The shape of the data passed to {@link Address}.
 *
 * @public
 */
export type AddressProps = {
  address: AddressType;
  lines?: AddressLine[];
  separator?: string;
};

/**
 * The shape of the data passed to {@link AddressLine}.
 *
 * @public
 */
export type AddressLineProps = {
  address: AddressType;
  line: AddressLine;
  separator?: string;
};

/**
 * The available listing publishers
 */
export enum ListingPublisher {
  googlemybusiness = "googlemybusiness",
}

/**
 * The type definition for a Listing
 */
export interface ListingType {
  listingUrl: string;
  publisher: ListingPublisher;
}

export enum MapProvider {
  Google = "GOOGLE",
  Apple = "APPLE",
  Bing = "BING",
}
