/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { Address } from "./address.js";
import { AddressType } from "./types.js";
import { render, screen } from "@testing-library/react";

const address: AddressType = {
  city: "Birmingham",
  countryCode: "US",
  line1: "1716 University Boulevard",
  localizedCountryName: "United States",
  localizedRegionName: "Alabama",
  postalCode: "35294",
  region: "AL",
};

describe("Address", () => {
  it("renders a default US Address", () => {
    render(<Address address={address} />);
  });

  it("includes a cooresponding localized title for all abbreviated values", () => {
    render(<Address address={address} />);

    const abbreviatedCountryEl = screen.getByTitle("United States");
    const abbreviatedRegionEl = screen.getByTitle("Alabama");

    expect(abbreviatedCountryEl && abbreviatedRegionEl).toBeTruthy();
  });

  it("renders with a custom separator", () => {
    const separator = "mySeparator";

    render(<Address address={address} separator={separator} />);

    const separatorEl = screen.getByText(separator);

    expect(separatorEl).toBeTruthy();
  });

  it("renders a custom address format", () => {
    render(<Address address={address} lines={[["line1"]]} />);

    const cityEl = screen.queryByText("Birmingham");
    const regionEl = screen.queryByText("AL");

    expect(cityEl && regionEl).toBeFalsy();
  });
});
