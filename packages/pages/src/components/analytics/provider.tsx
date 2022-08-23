import * as React from "react";
import { PropsWithChildren, useRef } from "react";
import { getRuntime } from "../../util";
import { Analytics } from "./Analytics";
import { AnalyticsMethods, AnalyticsProviderProps } from "./interfaces";
import { AnalyticsContext } from "./context";

/**
 * The main Analytics component for you to use. Sets up the proper react context
 * and bootstraps the Analytics reporter.
 *
 * @param props - A PropsWithChildren that implements AnalyticsProviderProps
 *
 * @public
 */
export function AnalyticsProvider(
  props: PropsWithChildren<AnalyticsProviderProps>
): JSX.Element {
  const {
    children,
    requireOptIn,
    enableTrackingCookie,
    enableDebugging,
    templateData,
  } = props;

  const analyticsRef = useRef<AnalyticsMethods | null>(null);

  if (analyticsRef.current === null) {
    analyticsRef.current = new Analytics(templateData, requireOptIn);
  }

  const analytics = analyticsRef.current;

  if (enableTrackingCookie) {
    analytics.enableTrackingCookie();
  }

  if (enableDebugging || debuggingParamDetected()) {
    analytics.setDebugEnabled(true);
  }

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * This will look for the xYextDebug parameter and if it is present,
 * enable analytics debugging.
 */
function debuggingParamDetected(): boolean {
  if (getRuntime().name !== "browser") {
    return false;
  }
  if (typeof window === undefined) {
    return false;
  }
  const currentUrl = new URL(window.location.href);
  return !!currentUrl.searchParams.get("xYextDebug");
}
