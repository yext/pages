import React from "react";
import { Meta, StoryFn } from "@storybook/react";
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

const meta: Meta<typeof AddressComponent> = {
  title: "components/Address",
  component: AddressComponent,
};

export default meta;

const Template: StoryFn<typeof AddressComponent> = (args) => (
  <AddressComponent {...args} />
);

// Address in the United States

// const app: ReturnType<typeof express> = express();
export const Address: StoryFn<typeof AddressComponent> = Template.bind({});

Address.args = {
  address: ADDRESS,
};

// Address to Yext Arlington Office

export const Address_Arlington: StoryFn<typeof AddressComponent> =
  Template.bind({});

Address_Arlington.args = {
  address: Arlington,
};

// Address to Yext Berlin Office

export const Address_Berlin: StoryFn<typeof AddressComponent> = Template.bind(
  {}
);

Address_Berlin.args = {
  address: Berlin,
};

// Address to Yext Chicago Office

export const Address_Chicago: StoryFn<typeof AddressComponent> = Template.bind(
  {}
);

Address_Chicago.args = {
  address: Chicago,
};

// Address to Yext London Office

export const Address_London: StoryFn<typeof AddressComponent> = Template.bind(
  {}
);

Address_London.args = {
  address: London,
};

// Address to Yext Miami Office

export const Address_Miami: StoryFn<typeof AddressComponent> = Template.bind(
  {}
);

Address_Miami.args = {
  address: Miami,
};

// Address to Yext New York Office

export const Address_NewYork: StoryFn<typeof AddressComponent> = Template.bind(
  {}
);

Address_NewYork.args = {
  address: NewYork,
};

// Address to Yext Paris Office

export const Address_Paris: StoryFn<typeof AddressComponent> = Template.bind(
  {}
);

Address_Paris.args = {
  address: Paris,
};

// Address to Yext San Francisco Office

export const Address_SanFrancisco: StoryFn<typeof AddressComponent> =
  Template.bind({});

Address_SanFrancisco.args = {
  address: SanFrancisco,
};
