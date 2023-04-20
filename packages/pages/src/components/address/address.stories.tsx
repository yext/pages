import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Address as AddressComponent } from ".";
import {
  ADDRESS,
  Arlington,
  Berlin,
  Chicago,
  London,
  Miami,
  NewYork,
  Paris,
  SanFrancisco,
} from "./sampleData.js";

const meta: ComponentMeta<typeof AddressComponent> = {
  title: "components/Address",
  component: AddressComponent,
};

export default meta;

const Template: ComponentStory<typeof AddressComponent> = (args) => (
  <AddressComponent {...args} />
);

// Address in the United States

export const Address = Template.bind({});

Address.args = {
  address: ADDRESS,
};

// Address to Yext Arlington Office

export const Address_Arlington = Template.bind({});

Address_Arlington.args = {
  address: Arlington,
};

// Address to Yext Berlin Office

export const Address_Berlin = Template.bind({});

Address_Berlin.args = {
  address: Berlin,
};

// Address to Yext Chicago Office

export const Address_Chicago = Template.bind({});

Address_Chicago.args = {
  address: Chicago,
};

// Address to Yext London Office

export const Address_London = Template.bind({});

Address_London.args = {
  address: London,
};

// Address to Yext Miami Office

export const Address_Miami = Template.bind({});

Address_Miami.args = {
  address: Miami,
};

// Address to Yext New York Office

export const Address_NewYork = Template.bind({});

Address_NewYork.args = {
  address: NewYork,
};

// Address to Yext Paris Office

export const Address_Paris = Template.bind({});

Address_Paris.args = {
  address: Paris,
};

// Address to Yext San Francisco Office

export const Address_SanFrancisco = Template.bind({});

Address_SanFrancisco.args = {
  address: SanFrancisco,
};
