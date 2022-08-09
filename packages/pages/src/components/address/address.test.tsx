import * as React from "react";
import { Address } from "./address";
import { AddressType } from "./types";
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
  it("properly render the Address component", () => {
    render(<Address address={address} />);
  });

  it("properly include unabbreviated alternative text as title text", () => {
    render(<Address address={address} />);

    const abbreviatedCountryEl = screen.getByTitle("United States");
    const abbreviatedRegionEl = screen.getByTitle("Alabama");

    expect(abbreviatedCountryEl && abbreviatedRegionEl).toBeTruthy();
  });

  it("properly include unabbreviated alternative text as title text", () => {
    render(<Address address={address} />);

    const abbreviatedCountryEl = screen.getByTitle("United States");
    const abbreviatedRegionEl = screen.getByTitle("Alabama");

    expect(abbreviatedCountryEl && abbreviatedRegionEl).toBeTruthy();
  });

  it("properly use custom separator string", () => {
    const separator = "mySeparator";

    render(<Address address={address} separator={separator} />);

    const separatorEl = screen.getByText(separator);

    expect(separatorEl).toBeTruthy();
  });

  it("properly customize address format with lines", () => {
    const separator = "mySeparator";

    render(<Address address={address} lines={[["line1"]]} />);

    const cityEl = screen.queryByText("Birmingham");
    const regionEl = screen.queryByText("AL");

    expect(cityEl && regionEl).toBeFalsy();
  });
});
