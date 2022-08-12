import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Image } from "./image";

const imgWidth = 20;
const imgHeight = 10;
const imgUUID = "uuid";
const width = 200;
const height = 100;
const widths = [100, 200, 300];
const aspectRatio = 1;
const image = {
  image: {
    height: 375,
    thumbnails: [
      {
        height: 375,
        url: "https://a.mktgcdn.com/p/kl4giA5KlVKbqfRIv9OsgtYEUIXR1SHTZISGNT_TrKw/300x375.jpg",
        width: 300
      }
    ],
    url: "https://a.mktgcdn.com/p/kl4giA5KlVKbqfRIv9OsgtYEUIXR1SHTZISGNT_TrKw/300x375.jpg",
    width: 300
  }
};

export default {
  title: "components/Image",
  component: Image,
} as ComponentMeta<typeof Image>;

const Template: ComponentStory<typeof Image> = (args) => <Image {...args} />;

export const Platform_Image = Template.bind({});

Platform_Image.args = {
  image: image,
};
