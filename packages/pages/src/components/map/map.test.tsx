/**
 * @jest-environment jsdom
 */
import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MapboxMaps } from "@yext/components-tsx-maps";
import { Clusterer, Map, Marker, useMapContext } from ".";

describe("Map", () => {
  it("renders with Google Maps", async () => {
    render(<Map clientKey="gme-yextinc" />);

    const title = "Open this area in Google Maps (opens a new window)";
    await waitFor(() => {
      expect(screen.findByTitle(title)).toBeTruthy();
    });
  });

  it("renders with Mapbox", async () => {
    render(<Map provider={MapboxMaps} apiKey={process.env.MAPBOX_APIKEY} />);

    const role = "region";
    await waitFor(() => {
      expect(screen.findByRole(role)).toBeTruthy();
    });
  });

  it("renders with Markers", async () => {
    render(
      <Map clientKey="gme-yextinc">
        <Marker
          id="1"
          coordinate={{ latitude: 38.8974, longitude: -97.0638 }}
        />
      </Map>
    );
  });

  it("userMapContext in map child component", async () => {
    const MapChildComponent = () => {
      const map = useMapContext();
      return <div>{map.getCenter()}</div>;
    };

    render(
      <Map clientKey="gme-yextinc">
        <MapChildComponent />
      </Map>
    );
  });

  it("userMapContext in non map child component", () => {
    const MapSiblingComponent = () => {
      useMapContext();
      return <div />;
    };

    expect(() => render(<MapSiblingComponent />)).toThrow();
  });

  it("renders with Clusterer", async () => {
    render(
      <Map clientKey="gme-yextinc">
        <Clusterer>
          <Marker
            id="1"
            coordinate={{ latitude: 38.8974, longitude: -97.0638 }}
          />
          <Marker
            id="1"
            coordinate={{ latitude: 38.9974, longitude: -97.1638 }}
          />
        </Clusterer>
      </Map>
    );
  });
});
