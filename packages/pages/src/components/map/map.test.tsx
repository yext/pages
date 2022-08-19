/**
 * @jest-environment jsdom
 */
 import * as React from "react";
 import { act } from "react-dom/test-utils";
 import { render, screen } from "@testing-library/react";
 import { MapboxMaps } from '@yext/components-tsx-maps';
 import {
   Map,
 } from ".";

describe("Map", () => {
  it("renders with Google Maps", () => {
    act(() => {
      render(<Map clientKey="gme-yextinc" />);
    });

    expect(screen.getByTestId("map")?.classList.contains('dir-map')).toBeTruthy();
  });

  it("renders with Mapbox", () => {
    act(() => {
      render(<Map provider={MapboxMaps} apiKey={process.env.MAPBOX_APIKEY} />)
    });

    expect(screen.getByTestId("map")?.classList.contains('dir-map')).toBeTruthy();
  });
});
