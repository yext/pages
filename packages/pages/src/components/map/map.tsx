import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import {
  GoogleMaps,
  Map as MapType,
  MapOptions,
} from "@yext/components-tsx-maps";
import { Coordinate, GeoBounds } from "@yext/components-tsx-geo";
import type { MapProps, MapContextType } from "./types.js";

export const MapContext = createContext<MapContextType | null>(null);

export function useMapContext() {
  const ctx = useContext(MapContext);

  if (!ctx || ctx.map === undefined) {
    throw new Error("Attempted to call useMapContext() outside of <Map>.");
  }

  return ctx.map;
}

export const Map = ({
  apiKey,
  bounds,
  children,
  className,
  clientKey,
  controls,
  defaultCenter,
  defaultZoom,
  mapRef,
  padding,
  panStartHandler,
  panHandler,
  provider,
  providerOptions,
  singleZoom,
}: MapProps) => {
  const wrapper = useRef(null);

  const [center, setCenter] = useState(defaultCenter);
  const [loaded, setLoaded] = useState(false);
  const [map, setMap] = useState<MapType>();
  const [zoom, setZoom] = useState(defaultZoom);

  // Update center on map move
  const _panHandler = (previous: GeoBounds, current: GeoBounds) => {
    panHandler(previous, current);
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

    const coordinates = bounds.map((bound) => new Coordinate(bound));
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
      .withPanHandler(_panHandler)
      .withPanStartHandler(panStartHandler)
      .withProvider(provider)
      .withProviderOptions(providerOptions)
      .withSinglePinZoom(singleZoom)
      .withWrapper(wrapper.current)
      .build();

    setMap(mapOptions);

    if (mapRef) {
      mapRef.current = mapOptions;
    }
  }, [loaded]);

  // On mount
  useEffect(() => {
    if (loaded || map || !wrapper.current) {
      return;
    }

    const useClientKey = provider.getProviderName() === "Google" && clientKey;
    provider
      .load(apiKey, useClientKey ? { client: clientKey } : {})
      .then(() => setLoaded(true));
  }, []);

  return (
    <div
      className={classnames(
        {
          "is-loaded": loaded,
        },
        className
      )}
      id="map"
      ref={wrapper}
      data-testid="map"
    >
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
  defaultCenter: { latitude: 39.83, longitude: -98.58 },
  defaultZoom: 4,
  padding: { bottom: 50, left: 50, right: 50, top: 50 },
  panHandler: () => null,
  panStartHandler: () => null,
  provider: GoogleMaps,
  providerOptions: {},
  singleZoom: 14,
};
