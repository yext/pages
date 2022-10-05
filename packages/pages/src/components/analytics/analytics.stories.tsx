import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import {
  AnalyticsProvider,
  AnalyticsScopeProvider,
  AnalyticsContext,
  ScopeContext,
} from "./index.js";

export default {
  title: "components/Analytics",
  component: AnalyticsProvider,
  subcomponents: { AnalyticsScopeProvider },
  decorators: [
    (Story) => (
      <AnalyticsProvider
        templateData={{
          document: {
            name: "sample entity",
          },
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

/**
 * See the context object on the analytics wrapper component
 * @returns
 */
export const Analytics: ComponentStory<typeof AnalyticsProvider> = () => {
  return (
    <AnalyticsScopeProvider name="analytics">
      <section>
        <h1>Analytics Parent</h1>
        <AnalyticsContext.Consumer>
          {(ctx) => (
            <button onClick={() => action("AnalyticsContext")(ctx)}>
              Log context
            </button>
          )}
        </AnalyticsContext.Consumer>
      </section>
    </AnalyticsScopeProvider>
  );
};

/**
 * See the context object on the analytics scope component
 * @returns
 */
export const Scope: ComponentStory<typeof AnalyticsProvider> = () => {
  return (
    <AnalyticsScopeProvider name="scopecontext">
      <section>
        <h1>Scope Parent</h1>
        <ScopeContext.Consumer>
          {(ctx) => (
            <button onClick={() => action("ScopeContext")(ctx)}>
              Log context
            </button>
          )}
        </ScopeContext.Consumer>
      </section>
    </AnalyticsScopeProvider>
  );
};
