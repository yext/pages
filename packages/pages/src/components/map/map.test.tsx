/**
 * @jest-environment jsdom
 */
 import * as React from "react";
 import { render, screen, waitFor } from "@testing-library/react";
 import { MapboxMaps } from '@yext/components-tsx-maps';
 import { Map } from ".";

describe("Map", () => {

  it("renders with Google Maps", async () => {
    render(<Map clientKey="gme-yextinc" />);

    const title = "Open this area in Google Maps (opens a new window)";
    await waitFor(() => { expect(screen.findByTitle(title)).toBeTruthy() });
  });

  it("renders with Mapbox", async () => {
    render(<Map provider={MapboxMaps} apiKey={process.env.MAPBOX_APIKEY} />);

    const role = "region";
    await waitFor(() => { expect(screen.findByRole(role)).toBeTruthy() });
  });
});
