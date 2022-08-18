/**
 * @jest-environment jsdom
 */
 import * as React from "react";
 import { render, screen } from "@testing-library/react";
 import { MapboxMaps } from '@yext/components-tsx-maps';
 import {
   Map,
 } from ".";

describe("Map", () => {
  it("renders with Google Maps", () => {
    render(<Map clientKey="gme-yextinc" />);

    // TODO: await map loading
    const mapEl = document.querySelector('.is-loaded');
    expect(!!mapEl).toBeTruthy();
  });

  it("renders with Mapbox", () => {
    render(<Map provider={MapboxMaps} apiKey={process.env.MAPBOX_APIKEY} />);

    // TODO: await map loading
    const mapEl = document.querySelector('.is-loaded');
    expect(!!mapEl).toBeTruthy();
  });
});
