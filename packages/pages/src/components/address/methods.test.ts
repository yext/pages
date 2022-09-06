import { getUnabbreviated } from "./methods.js";
import { AddressType } from "./types.js";

const address: AddressType = {
  city: "Birmingham",
  countryCode: "US",
  line1: "1716 University Boulevard",
  localizedCountryName: "United States",
  localizedRegionName: "Alabama",
  postalCode: "35294",
  region: "AL",
};

describe("getUnabbreviated()", () => {
  it("properly return the unabbreviated value of a field if it exists", () => {
    expect(getUnabbreviated("region", address)).toBe("Alabama");
  });

  it("return undefined if an unabbreviated value does not exist", () => {
    expect(getUnabbreviated("postalCode", address)).toBe(undefined);
  });
});
