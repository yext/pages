import React, { useState } from "react";
import { Meta } from "@storybook/react";
import { LocationMap } from ".";
import { getDirections } from "../address/methods.js";
import { MapProviderOption } from "../address/types.js";

export const meta: Meta<typeof LocationMap> = {
  title: "components/LocationMap",
  component: LocationMap,
};

const sampleAddress = {
  city: "New York",
  countryCode: "US",
  line1: "60 W 23rd St",
  postalCode: "10010",
  region: "NY",
};

// LocationMap that uses the default Marker icon

export const Map_With_Default_Icon = () => {
  return (
    <LocationMap
      clientKey="gme-yextinc"
      coordinate={{ latitude: 38.8974, longitude: -77.0638 }}
    />
  );
};

// LocationMap with Custom SVG

export const Map_With_No_Link = () => {
  return (
    <LocationMap
      clientKey="gme-yextinc"
      coordinate={{ latitude: 38.8974, longitude: -77.0638 }}
    >
      <svg width="30" height="38" fill="#F46036" viewBox="0 0 30 38">
        <path
          x="50%"
          y="40%"
          d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
        />
      </svg>
    </LocationMap>
  );
};

export const Map_With_Link = () => {
  return (
    <LocationMap
      clientKey="gme-yextinc"
      coordinate={{ latitude: 38.8974, longitude: -77.0638 }}
      pinUrl="https://yext.com"
    >
      <svg width="30" height="38" fill="#F46036" viewBox="0 0 30 38">
        <path
          x="50%"
          y="40%"
          d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
        />
      </svg>
    </LocationMap>
  );
};

// LocationMap with a different icon on hover

export const Map_With_Hover_State = () => {
  const [hovered, setHovered] = useState(false);
  const handleHover = (hovered: boolean) => {
    setHovered(hovered);
  };

  return (
    <LocationMap
      clientKey={"gme-yextinc"}
      coordinate={{ latitude: 40.74237, longitude: -73.99211 }}
      onHover={handleHover}
    >
      {hovered ? (
        <svg
          width="48px"
          height="48px"
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24,1.32c-9.92,0-18,7.8-18,17.38A16.83,16.83,0,0,0,9.57,29.09l12.84,16.8a2,2,0,0,0,3.18,0l12.84-16.8A16.84,16.84,0,0,0,42,18.7C42,9.12,33.92,1.32,24,1.32Z"
            fill="#ec5044"
          />
          <path
            d="M25.37,12.13a7,7,0,1,0,5.5,5.5A7,7,0,0,0,25.37,12.13Z"
            fill="#a1362e"
          />
        </svg>
      ) : (
        <svg
          width={30}
          height={38}
          fill="#F46036"
          viewBox="0 0 30 38"
          style={{ cursor: "pointer" }}
        >
          <path
            x="50%"
            y="40%"
            d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
          />
        </svg>
      )}
    </LocationMap>
  );
};

// LocationMap using getDirections()

export const Map_With_Directions_Link = () => {
  return (
    <LocationMap
      clientKey="gme-yextinc"
      coordinate={{ latitude: 40.74237, longitude: -73.99211 }}
      pinUrl={getDirections(sampleAddress, [], undefined, {
        provider: MapProviderOption.GOOGLE,
      })}
    >
      <svg width="30" height="38" fill="#F46036" viewBox="0 0 30 38">
        <path
          x="50%"
          y="40%"
          d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
        />
      </svg>
    </LocationMap>
  );
};
