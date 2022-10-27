import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Image } from "./image.js";

const image = {
  image: {
    height: 375,
    thumbnails: [
      {
        height: 375,
        url: "https://a.mktgcdn.com/p/kl4giA5KlVKbqfRIv9OsgtYEUIXR1SHTZISGNT_TrKw/300x375.jpg",
        width: 300,
      },
    ],
    url: "https://a.mktgcdn.com/p/kl4giA5KlVKbqfRIv9OsgtYEUIXR1SHTZISGNT_TrKw/300x375.jpg",
    width: 300,
  },
};

const meta: ComponentMeta<typeof Image> = {
  title: "components/Image",
  component: Image,
};

export default meta;

const Template: ComponentStory<typeof Image> = (args) => <Image {...args} />;

export const Platform_Image = Template.bind({});

Platform_Image.args = {
  image: image,
};
