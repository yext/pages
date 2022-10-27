import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Link } from "./link.js";

const meta: ComponentMeta<typeof Link> = {
  title: "components/Link",
  component: Link,
};

export default meta;

const Template: ComponentStory<typeof Link> = (args) => <Link {...args} />;

export const HREF = Template.bind({});

HREF.args = {
  href: "https://yext.com",
  children: "Learn More",
};

export const CTA = Template.bind({});

CTA.args = {
  cta: {
    link: "https://yext.com",
    label: "Learn More",
    linkType: "URL",
  },
};

export const Phone = Template.bind({});

Phone.args = {
  cta: {
    link: "2023013404",
    label: "Call us",
    linkType: "Phone",
  },
};

export const Email = Template.bind({});

Email.args = {
  cta: {
    link: "consulting-dev@yext.com",
    label: "Email Me",
    linkType: "Email",
  },
};

export const Detect_Email = Template.bind({});

Detect_Email.args = {
  cta: {
    link: "consulting-dev@yext.com",
  },
};

export const CTA_With_Children = Template.bind({});

CTA_With_Children.args = {
  cta: {
    link: "https://yext.com",
    label: "Learn More",
    linkType: "URL",
  },
  children: "Override label",
};
