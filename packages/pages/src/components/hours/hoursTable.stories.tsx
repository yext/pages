import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { HoursTable } from ".";
import { HOURS, HOURS_WITH_HOLIDAY, HOURS_WITH_REOPEN_DATE } from "./sampleData";

export default {
  title: "components/HoursTable",
  component: HoursTable,
} as ComponentMeta<typeof HoursTable>;

const Template: ComponentStory<typeof HoursTable> = (args) => <HoursTable {...args} />;


// Hours table with normal hours

export const NormalHours = Template.bind({});

NormalHours.args = {
  hours: HOURS,
  dayOfWeekNames: {
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tues',
    wednesday: 'Wed',
    thursday: 'Thur',
    friday: 'Fri',
    saturday: 'Sat',
  }
};

// Hours table with normal hours in military time

export const NormalHours24 = Template.bind({});

NormalHours24.args = {
  hours: HOURS,
  timeOptions: {
    hour12: false,
  },
};

// Hours table with an upcomming holiday

export const HolidayHours = Template.bind({});

HolidayHours.args = {
  hours: HOURS_WITH_HOLIDAY,
};

// Hours table that's temporarily closed

export const TemporarilyClosedHours = Template.bind({});

TemporarilyClosedHours.args = {
  hours: HOURS_WITH_REOPEN_DATE,
};
