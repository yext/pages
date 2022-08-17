import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { GoogleMaps, Map as MapType, MapOptions } from "@yext/components-tsx-maps";
import { Coordinate, GeoBounds } from "@yext/components-tsx-geo";
import { MapProps, MapContextType } from "./types";

export const MapContext = createContext<MapContextType | null>(null);

export function useMapContext() {
  const ctx = useContext(MapContext);

  if (!ctx || ctx.map === undefined) {
    throw new Error('Attempted to call useMapContext() outside of <Map>.');
  }

  return ctx.map;
}

export const Map = ({
  apiKey,
  bounds,
  children,
  clientKey,
  controls,
  getMapOptions,
  padding,
  panStartHandler,
  provider,
  providerOptions,
  singleZoom,
  ...rest
}: MapProps) => {
  const wrapper = useRef(null);

  const [center, setCenter] = useState(rest.center);
  const [loaded, setLoaded] = useState(false);
  const [map, setMap] = useState<MapType>();
  const [zoom, setZoom] = useState(rest.zoom);

  const panHandler = (previous: GeoBounds, current: GeoBounds) => {
    rest.panHandler(previous, current);
    setCenter(current.getCenter());
  };

  // On map move
  useEffect(() => {
    if (!loaded || !map) {
      return;
    }

    setZoom(map.getZoom());
  }, [center]);

  // On bounds change / init
  useEffect(() => {
    if (!bounds || !loaded || !map) {
      return;
    }

    const coordinates = bounds.map(bound => new Coordinate(bound));
    map.fitCoordinates(coordinates);
  }, [JSON.stringify(bounds), map]);

  // On map provider load
  useEffect(() => {
    if (!loaded || map) {
      return;
    }

    const mapOptions = new MapOptions()
      .withControlEnabled(controls)
      .withDefaultCenter(center)
      .withDefaultZoom(zoom)
      .withPadding(padding)
      .withPanHandler(panHandler)
      .withProvider(provider)
      .withProviderOptions(providerOptions)
      .withSinglePinZoom(singleZoom)
      .withWrapper(wrapper.current)
      .build();

    setMap(mapOptions);

    if (getMapOptions) {
      getMapOptions(mapOptions);
    }
  }, [loaded]);

  // On any change
  useEffect(() => {
    if (loaded || map || !wrapper.current) {
      return;
    }

    const useClientKey = provider.getProviderName() === 'Google' && clientKey;
    provider.load(apiKey, useClientKey ? { client: clientKey } : {})
      .then(() => setLoaded(true));
  }, []);

  return (
    <div className="dir-map" id="map" ref={wrapper}>
      {map && (
        <MapContext.Provider value={{ map, provider }}>
          {children}
        </MapContext.Provider>
      )}
    </div>
  );
};

Map.defaultProps = {
  controls: true,
  center: { latitude: 39.83, longitude: -98.58 },
  padding: { bottom: 50, left: 50, right: 50, top: 50 },
  panHandler: () => {},
  provider: GoogleMaps,
  singleZoom: 14,
  zoom: 4,
};
