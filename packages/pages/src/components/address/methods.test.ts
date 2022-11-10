import { getDirections, getUnabbreviated } from "./methods.js";
import {
  AddressType,
  ListingPublisherOption,
  ListingType,
  MapProviderOption,
} from "./types.js";

const sampleAddress: AddressType = {
  city: "New York",
  countryCode: "US",
  line1: "60 W 23rd St",
  postalCode: "10010",
  region: "NY",
};

const sampleAddress2: AddressType = {
  city: "Birmingham",
  countryCode: "US",
  line1: "1716 University Boulevard",
  localizedCountryName: "United States",
  localizedRegionName: "Alabama",
  postalCode: "35294",
  region: "AL",
};

const sampleListings: ListingType[] = [
  {
    listingUrl: "https://maps.google.com/maps?cid=3287244376840534043",
    publisher: ListingPublisherOption.GOOGLEMYBUSINESS,
  },
];

const sampleListingsLowerCase: ListingType[] = [
  {
    listingUrl: "https://maps.google.com/maps?cid=3287244376840534043",
    publisher:
      ListingPublisherOption.GOOGLEMYBUSINESS.toLowerCase() as "GOOGLEMYBUSINESS",
  },
];

const sampleListingsUpperCase: ListingType[] = [
  {
    listingUrl: "https://maps.google.com/maps?cid=3287244376840534043",
    publisher:
      ListingPublisherOption.GOOGLEMYBUSINESS.toUpperCase() as "GOOGLEMYBUSINESS",
  },
];

describe("getDirections()", () => {
  it("returns URL to Apple Maps address query", () => {
    expect(
      getDirections(sampleAddress, sampleListings, undefined, {
        provider: MapProviderOption.APPLE,
      })
    ).toEqual(
      "https://maps.apple.com/?address=60%20W%2023rd%20St,%20New%20York,%20NY,%2010010,%20US"
    );
  });

  it("returns URL to Bing Maps address query", () => {
    expect(
      getDirections(sampleAddress, sampleListings, undefined, {
        provider: MapProviderOption.BING,
      })
    ).toEqual(
      "https://bing.com/maps/default.aspx?where1=60%20W%2023rd%20St,%20New%20York,%20NY,%2010010"
    );
  });

  it("returns URL to Bing Maps address query with route from current location", () => {
    expect(
      getDirections(sampleAddress, sampleListings, undefined, {
        provider: MapProviderOption.BING,
        route: true,
      })
    ).toEqual(
      "https://bing.com/maps/default.aspx?rtp=adr.60%20W%2023rd%20St,%20New%20York,%20NY,%2010010"
    );
  });

  it("returns URL to Google Maps address query", () => {
    expect(getDirections(sampleAddress)).toEqual(
      "https://maps.google.com/maps/search/?api=1&query=60%20W%2023rd%20St,%20New%20York,%20NY,%2010010,%20US"
    );
  });

  it("returns URL to Google Maps address query with route from current location", () => {
    expect(
      getDirections(sampleAddress, undefined, undefined, {
        route: true,
      })
    ).toEqual(
      "https://maps.google.com/maps/dir/?api=1&destination=60%20W%2023rd%20St,%20New%20York,%20NY,%2010010,%20US"
    );
  });

  it("returns URL to Google Maps GMB listing", () => {
    expect(getDirections(undefined, sampleListings)).toEqual(
      "https://maps.google.com/maps?cid=3287244376840534043"
    );
  });

  it("returns URL to Google Maps GMB listing with lower case publisher", () => {
    expect(getDirections(undefined, sampleListingsLowerCase)).toEqual(
      "https://maps.google.com/maps?cid=3287244376840534043"
    );
  });

  it("returns URL to Google Maps GMB listing with upper case publisher", () => {
    expect(getDirections(undefined, sampleListingsUpperCase)).toEqual(
      "https://maps.google.com/maps?cid=3287244376840534043"
    );
  });

  it("returns URL to Google Maps Place ID with route", () => {
    expect(
      getDirections(undefined, undefined, "someID", { route: true })
    ).toEqual(
      "https://maps.google.com/maps/dir/?api=1&destination_place_id=someID&destination=direct"
    );
  });

  it("returns URL to Google Maps Place ID, by forcing route", () => {
    expect(getDirections(undefined, undefined, "someID")).toEqual(
      "https://maps.google.com/maps/dir/?api=1&destination_place_id=someID&destination=direct"
    );
  });
});

describe("getUnabbreviated()", () => {
  it("properly returns the unabbreviated value of a field if it exists", () => {
    expect(getUnabbreviated("region", sampleAddress2)).toBe("Alabama");
  });

  it("returns undefined if an unabbreviated value does not exist", () => {
    expect(getUnabbreviated("postalCode", sampleAddress2)).toBe(undefined);
  });
});
