import React from "react";
import { LocationMapProps } from "./types.js";
import { GoogleMaps } from "@yext/components-tsx-maps";
import { Map } from "../map/map.js";
import { Marker } from "../map/marker.js";
import { Link } from "../link/link.js";

export const LocationMap = ({
  children,
  coordinate,
  linkSameTab,
  pinUrl,
  onClick = () => null,
  onHover = () => null,
  onFocus = () => null,
  ...mapProps
}: LocationMapProps) => {
  return (
    <Map bounds={[coordinate]} {...mapProps}>
      <Marker
        coordinate={coordinate}
        id={"location-map-marker"}
        onClick={onClick}
        onHover={onHover}
        onFocus={onFocus}
      >
        {pinUrl ? (
          <Link href={pinUrl} target={linkSameTab ? "_self" : "_blank"}>
            {children}
          </Link>
        ) : children ? (
          children
        ) : undefined}
      </Marker>
    </Map>
  );
};

LocationMap.defaultProps = {
  controls: true,
  panHandler: () => null,
  provider: GoogleMaps,
  singleZoom: 16,
};
