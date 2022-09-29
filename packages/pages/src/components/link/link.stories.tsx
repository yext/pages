import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Link } from "./link.js";

export default {
  title: "components/Link",
  component: Link,
} as ComponentMeta<typeof Link>;

const Template: ComponentStory<typeof Link> = (args) => <Link {...args} />;

// HREF
export const HREF = Template.bind({});

HREF.args = {
  href: "https://yext.com",
  children: "Learn More",
};

// CTA
export const CTA = Template.bind({});

CTA.args = {
  cta: {
    link: "https://yext.com",
    label: "Learn More",
    linkType: "URL",
  },
};

// Phone
export const Phone = Template.bind({});

Phone.args = {
  cta: {
    link: "2023013404",
    label: "Call us",
    linkType: "Phone",
  },
};

// Email
export const Email = Template.bind({});

Email.args = {
  cta: {
    link: "consulting-dev@yext.com",
    label: "Email Me",
    linkType: "Email",
  },
};

// Detect Email
export const Detect_Email = Template.bind({});

Detect_Email.args = {
  cta: {
    link: "consulting-dev@yext.com",
  },
};

// CTA with children
export const CTA_With_Children = Template.bind({});

CTA_With_Children.args = {
  cta: {
    link: "https://yext.com",
    label: "Learn More",
    linkType: "URL",
  },
  children: "Override label",
};
