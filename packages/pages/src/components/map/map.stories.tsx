import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { MapPinOptions } from '@yext/components-tsx-maps';
import { Map, Marker } from ".";

export default {
  title: "components/Map",
  component: Map,
} as ComponentMeta<typeof Map>;

const Template: ComponentStory<typeof Map> = (args) => <Map {...args} />;

// Simple Map

export const Simple_Map = Template.bind({});
Simple_Map.args = {
  clientKey: 'gme-yextinc'
}

// Map With Marker

export const Map_With_Marker = () => {
  return (
    <Map clientKey='gme-yextinc'>
      <Marker
        id='1'
        onClick={ () => window.open('https://yext.com', '_blank') }
        mapPinOptions={
          new MapPinOptions()
            .withCoordinate({ latitude: 38.8954, longitude: -77.0698 })
        }
      />
    </Map>
  )
}

// Map with SVG Marker

export const Map_With_Inline_Svg = () => {
  return (
    <Map clientKey='gme-yextinc'>
      <Marker id='1' coordinate={{ latitude: 38.8974, longitude: -77.0638 }} onClick={() => {}}>
        <svg width="30" height="48" fill="#F46036" viewBox="0 0 30 38" style={{cursor: "pointer"}}>
          <path x="50%" y="40%" d="M30 15.0882C30 23.4212 23.3333 30.7353 15 38C7.22222 31.2941 0 23.4212 0 15.0882C0 6.75523 6.71573 0 15 0C23.2843 0 30 6.75523 30 15.0882Z"/>	
        </svg>
      </Marker>
    </Map>
  );
}
