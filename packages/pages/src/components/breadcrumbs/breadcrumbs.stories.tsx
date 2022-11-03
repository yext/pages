import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Breadcrumbs as BreadcrumbComponent } from ".";
import {
  BREADCRUMBS_FULL,
  BREADCRUMBS_SINGLE,
  BREADCRUMBS_TWO,
} from "./sampleData.js";

export default {
  title: "components/Breadcrumb",
  component: BreadcrumbComponent,
} as ComponentMeta<typeof BreadcrumbComponent>;

const Template: ComponentStory<typeof BreadcrumbComponent> = (args) => (
  <BreadcrumbComponent {...args} />
);

// Single Breadcrumb
export const Breadcrumbs_single = Template.bind({});

Breadcrumbs_single.args = {
  breadcrumbs: BREADCRUMBS_SINGLE,
};

// Two Breadcrumbs
export const Breadcrumbs_two = Template.bind({});

Breadcrumbs_two.args = {
  breadcrumbs: BREADCRUMBS_TWO,
};

// Full 3-level Breadcrumbs
export const Breadcrumbs_full = Template.bind({});

Breadcrumbs_full.args = {
  breadcrumbs: BREADCRUMBS_FULL,
};

// Different Separator
export const Breadcrumbs_separator = Template.bind({});

Breadcrumbs_separator.args = {
  breadcrumbs: BREADCRUMBS_FULL,
  separator: ">",
};
