/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { LocationMap } from ".";
import { MapboxMaps } from "@yext/components-tsx-maps";

describe("LocationMap", () => {
  it("renders with Google Maps", async () => {
    render(
      <LocationMap
        clientKey="gme-yextinc"
        coordinate={{ latitude: 38.8974, longitude: -97.0638 }}
      />
    );

    const title = "Open this area in Google Maps (opens a new window)";
    await waitFor(() => {
      expect(screen.findByTitle(title)).toBeTruthy();
    });
  });

  it("renders with Mapbox", async () => {
    render(
      <LocationMap
        provider={MapboxMaps}
        apiKey={process.env.MAPBOX_APIKEY}
        coordinate={{ latitude: 38.8974, longitude: -97.0638 }}
      />
    );

    const role = "region";
    await waitFor(() => {
      expect(screen.findByRole(role)).toBeTruthy();
    });
  });

  it("renders with Link", () => {
    render(
      <LocationMap
        provider={MapboxMaps}
        apiKey={process.env.MAPBOX_APIKEY}
        coordinate={{ latitude: 38.8974, longitude: -97.0638 }}
        pinUrl="https://yext.com"
      />
    );
  });

  it("renders with child", () => {
    render(
      <LocationMap
        provider={MapboxMaps}
        apiKey={process.env.MAPBOX_APIKEY}
        coordinate={{ latitude: 38.8974, longitude: -97.0638 }}
        pinUrl="https://yext.com"
      >
        <svg
          width="48px"
          height="48px"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24,1.32c-9.92,0-18,7.8-18,17.38A16.83,16.83,0,0,0,9.57,29.09l12.84,16.8a2,2,0,0,0,3.18,0l12.84-16.8A16.84,16.84,0,0,0,42,18.7C42,9.12,33.92,1.32,24,1.32Z"
            fill="#ec5044"
          />
          <path
            d="M25.37,12.13a7,7,0,1,0,5.5,5.5A7,7,0,0,0,25.37,12.13Z"
            fill="#a1362e"
          />
        </svg>
      </LocationMap>
    );
  });
});
