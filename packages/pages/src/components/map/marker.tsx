import React, { useContext, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { MapPin, MapPinOptions } from "@yext/components-tsx-maps";
import { MapContext } from "./map.js";
import { MapContextType, MarkerProps } from "./types.js";

const defaultMarkerIcon = (
  <svg
    width="30"
    height="38"
    viewBox="0 0 30 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
      fill="red"
    />
  </svg>
);

export const Marker = ({
  children,
  coordinate,
  hideOffscreen,
  id,
  icon,
  onClick,
  onFocus,
  onHover,
  zIndex,
}: MarkerProps): JSX.Element | null => {
  const { map, provider } = useContext(MapContext) as MapContextType;

  const marker: MapPin = useMemo(() => {
    return new MapPinOptions()
      .withCoordinate(coordinate)
      .withHideOffscreen(hideOffscreen)
      .withProvider(provider)
      .build();
  }, []);

  // Sync z-index
  useEffect(() => {
    if (zIndex !== 0 && !zIndex) {
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
    };
  }, []);

  const elementToRender = children ? children : icon;

  if (elementToRender) {
    const pinEl = marker.getProviderPin().getPinElement();
    Object.assign(pinEl.style, {
      height: "auto",
      width: "auto",
      fontSize: 0,
    });
    return createPortal(elementToRender, pinEl);
  }

  return null;
};

Marker.defaultProps = {
  hideOffscreen: false,
  icon: defaultMarkerIcon,
  onClick: () => null,
  onHover: () => null,
  onFocus: () => null,
};
