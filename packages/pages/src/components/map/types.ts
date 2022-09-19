import type { Map as MapType, MapProvider } from "@yext/components-tsx-maps";
import type { GeoBounds } from "@yext/components-tsx-geo";
import React from "react";

export interface Coordinate {
  latitude: number;
  longitude: number;
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
  defaultCenter?: Coordinate;
  defaultZoom?: number;
  mapRef?: React.MutableRefObject<MapType | null>;
  padding?:
    | number
    | {
        bottom: number | (() => number);
        left: number | (() => number);
        right: number | (() => number);
        top: number | (() => number);
      };
  panHandler: (previousBounds: GeoBounds, currentBounds: GeoBounds) => void;
  panStartHandler?: (currentBounds: GeoBounds) => void;
  provider: MapProvider;
  providerOptions?: { [key: string]: any };
  singleZoom: number;
}

// Marker

export interface MarkerProps {
  children?: React.ReactChild;
  coordinate: Coordinate;
  hideOffscreen?: boolean;
  icon?: JSX.Element;
  id: string;
  onClick: (id: string) => void;
  onHover: (hovered: boolean, id: string) => void;
  onFocus: (focused: boolean, id: string) => void;
  statusOptions?: { [key: string]: boolean };
  zIndex?: number;
}
