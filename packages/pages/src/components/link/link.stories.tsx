import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Link } from "./link.js";

const meta: Meta<typeof Link> = {
  title: "components/Link",
  component: Link,
};

export default meta;

const Template: StoryFn<typeof Link> = (args) => <Link {...args} />;

export const HREF: StoryFn<typeof Link> = Template.bind({});

HREF.args = {
  href: "https://yext.com",
  children: "Learn More",
};

export const CTA: StoryFn<typeof Link> = Template.bind({});

CTA.args = {
  cta: {
    link: "https://yext.com",
    label: "Learn More",
    linkType: "URL",
  },
};

export const Phone: StoryFn<typeof Link> = Template.bind({});

Phone.args = {
  cta: {
    link: "2023013404",
    label: "Call us",
    linkType: "Phone",
  },
};

export const Email: StoryFn<typeof Link> = Template.bind({});

Email.args = {
  cta: {
    link: "consulting-dev@yext.com",
    label: "Email Me",
    linkType: "Email",
  },
};

export const Detect_Email: StoryFn<typeof Link> = Template.bind({});

Detect_Email.args = {
  cta: {
    link: "consulting-dev@yext.com",
  },
};

export const CTA_With_Children: StoryFn<typeof Link> = Template.bind({});

CTA_With_Children.args = {
  cta: {
    link: "https://yext.com",
    label: "Learn More",
    linkType: "URL",
  },
  children: "Override label",
};
