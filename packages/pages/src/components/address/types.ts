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
export interface AddressProps extends React.HTMLProps<HTMLDivElement> {
  address: AddressType;
  lines?: AddressLine[];
  separator?: string;
}

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
 *
 * @public
 */
export const ListingPublisherOption = {
  GOOGLEMYBUSINESS: "GOOGLEMYBUSINESS",
} as const;

/**
 * The type definition for the listing publisher
 *
 * @public
 */
export type ListingPublisher =
  (typeof ListingPublisherOption)[keyof typeof ListingPublisherOption];

/**
 * The type definition for a Listing
 *
 * @public
 */
export interface ListingType {
  listingUrl: string;
  publisher?: ListingPublisher;
}

/**
 * The available map providers
 *
 * @public
 */
export const MapProviderOption = {
  GOOGLE: "google",
  APPLE: "apple",
  BING: "bing",
} as const;

/**
 * The type definition for the map provider
 *
 * @public
 */
export type MapProvider =
  (typeof MapProviderOption)[keyof typeof MapProviderOption];

/**
 * The Yext profile fields used to create a getDirections URL
 */
export interface GetDirectionsConfig {
  provider?: MapProvider;
  route?: boolean;
}
