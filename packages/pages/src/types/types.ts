// Address
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  countryCode: string;
}

// Coordinate
export interface Coordinate {
  latitude: number;
  longitude: number;
}

// CTA
export enum LinkType {
  URL = "URL",
  Email = "Email",
  Phone = "Phone",
}

export interface CTA {
  link: string;
  label: string;
  linkType?: LinkType;
}

// Hours
export interface Hours {
  monday?: Day;
  tuesday?: Day;
  wednesday?: Day;
  thursday?: Day;
  friday?: Day;
  saturday?: Day;
  sunday?: Day;
  holidayHours?: Holiday[];
  reopenDate?: string;
}

export interface Day {
  isClosed: boolean;
  openIntervals: OpenIntervals[];
}

export interface Holiday extends Day {
  date: string;
}

export interface OpenIntervals {
  start: string;
  end: string;
}

// Image
export interface Image {
  height: number;
  width: number;
  url: string;
}

// Entities
export interface EntityType {
  id: string;
  uid: number;
}

export interface Meta {
  entityType: EntityType;
  locale: string;
  updateTimestamp: string;
}

export enum PaymentOptions {
  AMERICANEXPRESS = "AMERICANEXPRESS",
  APPLEPAY = "APPLEPAY",
  BITCOIN = "BITCOIN",
  CASH = "CASH",
  CHECK = "CHECK",
  MASTERCARD = "MASTERCARD",
  PAYPAL = "PAYPAL",
  VISA = "VISA",
}

export enum ListingPublisher {
  googlemybusiness = "googlemybusiness",
}

export interface Listing {
  listingUrl: string;
  publisher: ListingPublisher;
}

export interface Entity {
  businessId: number;
  description?: string;
  id: string;
  key: string;
  mainPhone?: string;
  locale: string;
  meta: Meta;
  name: string;
  paymentOptions?: PaymentOptions;
  photoGallery?: Image[];
  services?: string[];
  siteId: number;
  slug: string;
  uid: number;
}

export interface Location extends Entity {
  address: Address;
  geocodedCoordinate: Coordinate;
  neighborhood?: string;
  ref_listings?: Listing[];
}
