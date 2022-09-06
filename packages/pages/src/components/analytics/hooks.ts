import { ConversionDetails, Visitor } from "@yext/analytics";
import { MouseEvent, useContext } from "react";
import { getRuntime } from "../../util/index.js";
import { AnalyticsContext } from "./context.js";
import { concatScopes } from "./helpers.js";
import { AnalyticsMethods } from "./interfaces.js";
import { useScope } from "./scope.js";

declare global {
  interface Window {
    setAnalyticsOptIn: () => void;
  }
}

/**
 * The useAnalytics hook can be used anywhere in the tree below a configured
 * AnalyticsProvider.  Calling it will return an object to give you access to
 * the analytics convenience methods for use in your components,
 * such as track(), pageView(), optIn() etc.
 *
 * @public
 */
export function useAnalytics(): AnalyticsMethods | null {
  const ctx = useContext(AnalyticsContext);

  if (!ctx) {
    return ctx;
  }

  // TODO: is this the right way / place to expose a callback for use by a Cookie Management banner?
  if (getRuntime().name === "browser" && !window.setAnalyticsOptIn) {
    window.setAnalyticsOptIn = async () => {
      await ctx.optIn();
    };
  }

  const scope = useScope();

  // TODO: this is ugly, I imagine there is a more elegant way of doing this
  return {
    trackClick(
      eventName: string,
      conversionData?: ConversionDetails
    ): (e: MouseEvent<HTMLAnchorElement>) => Promise<void> {
      return ctx.trackClick(concatScopes(scope, eventName), conversionData);
    },
    setDebugEnabled(enabled: boolean): void {
      return ctx.setDebugEnabled(enabled);
    },
    enableTrackingCookie(): void {
      return ctx.enableTrackingCookie();
    },
    identify(visitor: Visitor): void {
      return ctx.identify(visitor);
    },
    optIn(): Promise<void> {
      return ctx.optIn();
    },
    pageView(): Promise<void> {
      return ctx.pageView();
    },
    track(
      eventName: string,
      conversionData?: ConversionDetails
    ): Promise<void> {
      return ctx.track(concatScopes(scope, eventName), conversionData);
    },
  };
}

/**
 * Simpler hook that just returns the analytics track() method.
 *
 * @public
 */
export const useTrack = () => {
  return useAnalytics()?.track;
};

/**
 * Simpler hook that just returns returns the analytics pageView method
 *
 * @public
 */
export const usePageView = () => {
  return useAnalytics()?.pageView;
};

/**
 * Simpler hook that just returns the analytics identify method
 *
 * @public
 */
export const useIdentify = () => {
  return useAnalytics()?.identify;
};
