import type {
  Map as MapType,
  MapProvider,
  MapPin,
} from "@yext/components-tsx-maps";
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

// Clusterer

export type ClusterTemplateProps = {
  count?: number;
};

export type ClustererProps = {
  clusterRadius?: number;
  children: JSX.Element[] | JSX.Element;
  ClusterTemplate?: (props: ClusterTemplateProps) => JSX.Element;
};

export type PinStoreType = {
  id: string;
  pin: MapPin;
};

export interface ClustererContextType {
  clusters: PinStoreType[][];
  clusterIds: string[];
  setPinStore: React.Dispatch<React.SetStateAction<PinStoreType[]>>;
}
