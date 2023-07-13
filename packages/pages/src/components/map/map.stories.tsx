import React, { useRef, useState } from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Map, Marker, Coordinate as CoordinateType } from ".";
import { MAP_MULTIPLE_LOCATIONS } from "./sampleData.js";
import { Map as MapType } from "@yext/components-tsx-maps";

const meta: Meta<typeof Map> = {
  title: "components/Map",
  component: Map,
};

export default meta;

const Template: StoryFn<typeof Map> = (args) => <Map {...args} />;

// Simple Map

export const Simple_Map: StoryFn<typeof Map> = Template.bind({});
Simple_Map.args = {
  clientKey: "gme-yextinc",
};

// Map With Marker

export const Map_With_Marker = () => {
  return (
    <Map clientKey="gme-yextinc">
      <Marker
        id="1"
        onClick={() => window.open("https://yext.com", "_blank")}
        coordinate={{ latitude: 38.8974, longitude: -77.0638 }}
      />
    </Map>
  );
};

export const Map_With_Current_Center_And_Zoom = () => {
  const mapRef = useRef<MapType | null>(null);
  const [currentCenter, setCurrentCenter] = useState<CoordinateType>({
    latitude: 37.83,
    longitude: -77.58,
  });
  const [currentZoom, setCurrentZoom] = useState<number>(5);

  const panHandler = () => {
    if (mapRef.current) {
      setCurrentCenter(mapRef.current.getCenter());
      setCurrentZoom(mapRef.current.getZoom());
    }
  };

  return (
    <Map
      clientKey="gme-yextinc"
      defaultZoom={5}
      defaultCenter={{ latitude: 37.83, longitude: -77.58 }}
      mapRef={mapRef}
      panHandler={panHandler}
    >
      <div
        style={{ position: "absolute", backgroundColor: "white", padding: 4 }}
      >
        <div>
          lat: {currentCenter.latitude.toFixed(2)}, long:{" "}
          {currentCenter.longitude.toFixed(2)}
        </div>
        <div>zoom: {currentZoom}</div>
      </div>
      <Marker
        id="1"
        onClick={() => window.open("https://yext.com", "_blank")}
        coordinate={{ latitude: 38.8974, longitude: -77.0638 }}
      />
    </Map>
  );
};

/**
 * Multiple maps loaded on to the same page.
 */

export const Multiple_Maps = () => {
  return (
    <div>
      <Map
        clientKey="gme-yextinc"
        bounds={[{ latitude: 38.8974, longitude: -77.0638 }]}
        singleZoom={16}
      >
        <Marker
          id="1"
          coordinate={{ latitude: 38.8974, longitude: -77.0638 }}
        />
      </Map>
      <Map
        clientKey="gme-yextinc"
        defaultCenter={{ latitude: 38.8974, longitude: -77.0638 }}
        defaultZoom={16}
      >
        <Marker
          id="1"
          coordinate={{ latitude: 38.8974, longitude: -77.0638 }}
        />
      </Map>
    </div>
  );
};

// Map with SVG Marker

export const Map_With_Inline_Svg = () => {
  return (
    <Map clientKey="gme-yextinc">
      <Marker id="1" coordinate={{ latitude: 38.8974, longitude: -77.0638 }}>
        <svg width="30" height="38" fill="#F46036" viewBox="0 0 30 38">
          <path
            x="50%"
            y="40%"
            d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
          />
        </svg>
      </Marker>
    </Map>
  );
};

export const Map_With_Single_Interactive_Marker = () => {
  const [clicked, setClicked] = useState("");
  const [focused, setFocused] = useState("");
  const [hovered, setHovered] = useState("");

  return (
    <Map clientKey="gme-yextinc">
      <Marker
        coordinate={{ latitude: 38.8954, longitude: -77.0698 }}
        id={"123"}
        onClick={(id: string) => setClicked(id)}
        onFocus={(focused: boolean, id: string) =>
          setFocused(focused ? id : "")
        }
        onHover={(hovered: boolean, id: string) =>
          setHovered(hovered ? id : "")
        }
      >
        <svg
          width={clicked ? 50 : hovered || focused ? 35 : 30}
          height={clicked ? 50 : hovered || focused ? 43 : 38}
          fill={clicked ? "#000" : hovered || focused ? "#FF0000" : "#F46036"}
          viewBox="0 0 30 38"
        >
          <path
            x="50%"
            y="40%"
            d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
          />
        </svg>
      </Marker>
    </Map>
  );
};

export const Map_With_Multiple_Interactive_Markers = () => {
  const [selectedId, setSelectedId] = useState("");
  const [focusedId, setFocusedId] = useState("");
  const [hoveredId, setHoveredId] = useState("");

  return (
    <Map
      bounds={MAP_MULTIPLE_LOCATIONS.map((location) => location.coordinate)}
      clientKey="gme-yextinc"
    >
      {MAP_MULTIPLE_LOCATIONS.map((location, index) => (
        <Marker
          key={location.id}
          coordinate={location.coordinate}
          id={location.id}
          onClick={(id) => setSelectedId(id)}
          onFocus={(focused, id) => setFocusedId(focused ? id : "")}
          onHover={(hovered, id) => setHoveredId(hovered ? id : "")}
          zIndex={
            location.id === selectedId
              ? 1
              : location.id === focusedId || location.id === hoveredId
              ? 2
              : 0
          }
        >
          <svg
            width={location.id === selectedId ? 40 : 30}
            height={location.id === selectedId ? 50 : 38}
            fill={location.id === selectedId ? "white" : "black"}
            viewBox="0 0 30 38"
          >
            <path
              x="50%"
              y="40%"
              d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"
              stroke={
                location.id === focusedId || location.id === hoveredId
                  ? "white"
                  : "none"
              }
            />
            <text
              x="50%"
              y="40%"
              fontSize="16px"
              fontWeight="bold"
              dominantBaseline="middle"
              textAnchor="middle"
              fill={location.id === selectedId ? "black" : "white"}
            >
              {index}
            </text>
          </svg>
        </Marker>
      ))}
    </Map>
  );
};
