import type { Map as MapType, MapProvider } from "@yext/components-tsx-maps";
import type { GeoBounds } from "@yext/components-tsx-geo";

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
