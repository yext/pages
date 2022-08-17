import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Map } from ".";

export default {
  title: "components/Map",
  component: Map,
} as ComponentMeta<typeof Map>;

const Template: ComponentStory<typeof Map> = (args) => <Map {...args} />;

// Basic Map

export const Simple_Map = Template.bind({});

Simple_Map.args = {
  zoom: 5,
};
