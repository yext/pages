import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { HoursStatus } from "./hoursStatus.js";
import { HoursData } from "./sampleData.js";

export default {
  title: "Components/HoursStatus",
  component: HoursStatus,
} as ComponentMeta<typeof HoursStatus>;

const Template: ComponentStory<typeof HoursStatus> = (args) => (
  <HoursStatus {...args} />
);

export const DefaultComponent = Template.bind({});
DefaultComponent.args = {
  hours: HoursData,
};

export const TwentyFourHoursClock = Template.bind({});
TwentyFourHoursClock.args = {
  hours: HoursData,
  timeOptions: { hour12: false },
};

export const CustomTemplateOverride = Template.bind({});
CustomTemplateOverride.args = {
  hours: HoursData,
  currentTemplate: () => "Open Currently",
  separatorTemplate: () => " • ",
  futureTemplate: (params) => {
    return (
      <span className="HoursStatus-future">
        {params.isOpen ? "Will be closing at" : "Will be opening at"}
      </span>
    );
  },
  timeTemplate: () => " HH:MM ",
  dayOfWeekTemplate: () => "Gameday",
};
