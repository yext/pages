import type { Map as MapType, MapProvider, PinProperties, MapPinOptions } from "@yext/components-tsx-maps";
import type { GeoBounds } from "@yext/components-tsx-geo";
import React from "react";

export interface Coordinate {
  latitude: number
  longitude: number
}

export interface MapContextType {
  map: MapType;
  provider: MapProvider;
}

export interface MapProps {
  apiKey?: string;
  bounds?: Coordinate[];
  className?: string;
  clientKey?: string;
  children?: any;
  controls: boolean;
  center?: Coordinate;
  zoom?: number;
  getMapOptions?: React.Dispatch<React.SetStateAction<MapType | null>>;
  padding?: number | {
    bottom: number | (() => number);
    left: number | (() => number);
    right: number | (() => number);
    top: number | (() => number);
  },
  panHandler: (previousBounds: GeoBounds, currentBounds: GeoBounds) => void;
  panStartHandler?: (currentBounds: GeoBounds) => void;
  provider: MapProvider;
  providerOptions?: {};
  singleZoom: number;
}

// Marker

export interface BaseMarker {
  hideOffscreen?: boolean;
  icon: JSX.Element;
  id: string;
  onClick: (id: string) => void;
  onHover: (hovered: boolean, id: string) => void;
  onFocus: (focused: boolean, id: string) => void;
  payload: { [key: string]: boolean };
  pinProperties: (status: string) => PinProperties;
}

export interface DefaultMarker extends BaseMarker {
  children?: never;
  coordinate?: never;
  mapPinOptions: MapPinOptions;
  zIndex?: never;
}

export interface CustomMarker extends BaseMarker {
  children: React.ReactChild;
  coordinate: Coordinate;
  mapPinOptions?: never;
  zIndex?: number;
}

export type MarkerProps = CustomMarker | DefaultMarker;
