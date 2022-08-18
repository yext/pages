import React, { useContext, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, MapPinOptions, PinProperties } from "@yext/components-tsx-maps";
import { MapContext } from "./map"
import { MapContextType, MarkerProps } from "./types"

export const Marker = ({
  children,
  coordinate,
  hideOffscreen,
  icon,
  id,
  mapPinOptions,
  onClick,
  onFocus,
  onHover,
  payload,
  pinProperties,
  zIndex,
}: MarkerProps) => {
  const { map, provider } = useContext(MapContext) as MapContextType;
  const iconURI = 'data:image/svg+xml;utf8,' + encodeURIComponent(renderToStaticMarkup(icon));

  const marker: MapPin = useMemo(() => {
    if (children && coordinate) {
      return new MapPinOptions()
        .withCoordinate(coordinate)
        .withHideOffscreen(hideOffscreen)
        .withPropertiesForStatus(pinProperties)
        .withProvider(provider)
        .build();
    }

    if (mapPinOptions) {
      return mapPinOptions
        .withProvider(provider)
        .withIcon('default', iconURI)
        .build();
    }

    return null;
  }, []);

  // Sync status
  useEffect(() => {
    marker.setStatus({...payload});
  }, [payload]);

  // Sync z-index
  useEffect(() => {
    if (!zIndex) {
      return;
    }
    const wrapper = marker.getProviderPin().getWrapperElement();
    wrapper.style.zIndex = zIndex;
  }, [zIndex]);

  // Sync events
  useEffect(() => {
    marker.setMap(map);
    marker.setClickHandler(() => onClick(id));
    marker.setFocusHandler((focused: boolean) => onFocus(focused, id));
    marker.setHoverHandler((hovered: boolean) => onHover(hovered, id));

    return () => {
      marker.setMap(null);
    }
  }, []);

  if (children) {
    const pinEl = marker.getProviderPin().getPinElement();
    return createPortal(
      <div>
        {children}
      </div>
    , pinEl);
  }

  return null;
}

Marker.defaultProps = {
  hideOffscreen: false,
  icon: (
    <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z" fill="red" />
    </svg>
  ),
  onClick: () => {},
  onHover: () => {},
  onFocus: () => {},
  payload: {},
  pinProperties: () => new PinProperties(),
};
