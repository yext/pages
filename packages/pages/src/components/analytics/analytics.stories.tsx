import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import {
  AnalyticsProvider,
  AnalyticsScopeProvider,
  useAnalytics,
} from "./index.js";

export default {
  title: "components/Analytics",
  component: AnalyticsProvider,
  subcomponents: { AnalyticsScopeProvider },
  decorators: [
    (Story) => (
      <AnalyticsProvider
        templateData={{
          document: {},
          __meta: {
            mode: "development",
          },
        }}
        enableDebugging={true}
      >
        <Story />
      </AnalyticsProvider>
    ),
  ],
} as ComponentMeta<typeof AnalyticsProvider>;

export const Basic: ComponentStory<typeof AnalyticsProvider> = (args) => {
  const analytics = useAnalytics();

  const handleClick = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!analytics) return;

    const ya = await analytics.trackClick("basic", {
      cid: "123",
      cv: "test",
    })(e);
    // TODO: export a response from trackClick
    action("trackClick")("Payload TODO");
  };

  return (
    <AnalyticsScopeProvider name="section1">
      <section>
        <a onClick={(e) => handleClick(e)}>Click me</a>
      </section>
    </AnalyticsScopeProvider>
  );
};
