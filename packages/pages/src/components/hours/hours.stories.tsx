import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Hours } from ".";
import {
  HOURS,
  HOURS_WITH_HOLIDAY,
  HOURS_WITH_REOPEN_DATE,
} from "./sampleData.js";

const meta: Meta<typeof Hours> = {
  title: "components/Hours",
  component: Hours,
};

export default meta;

const Template: StoryFn<typeof Hours> = (args) => <Hours {...args} />;

// Hours table with normal hours

export const NormalHours: StoryFn<typeof Hours> = Template.bind({});

NormalHours.args = {
  hours: HOURS,
  dayOfWeekNames: {
    sunday: "Sun",
    monday: "Mon",
    tuesday: "Tues",
    wednesday: "Wed",
    thursday: "Thur",
    friday: "Fri",
    saturday: "Sat",
  },
};

// Hours table with normal hours in military time

export const NormalHours24: StoryFn<typeof Hours> = Template.bind({});

NormalHours24.args = {
  hours: HOURS,
  timeOptions: {
    hour12: false,
  },
};

// Hours table with an upcomming holiday

export const HolidayHours: StoryFn<typeof Hours> = Template.bind({});

HolidayHours.args = {
  hours: HOURS_WITH_HOLIDAY,
};

// Hours table that's temporarily closed

export const TemporarilyClosedHours: StoryFn<typeof Hours> = Template.bind({});

TemporarilyClosedHours.args = {
  hours: HOURS_WITH_REOPEN_DATE,
};
