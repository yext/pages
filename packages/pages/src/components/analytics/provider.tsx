import * as React from "react";
import { PropsWithChildren, useRef } from "react";
import { getRuntime } from "../../util/index.js";
import { Analytics } from "./Analytics.js";
import { AnalyticsMethods, AnalyticsProviderProps } from "./interfaces.js";
import { AnalyticsContext } from "./context.js";

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
    pageDomain,
  } = props;

  const analyticsRef = useRef<AnalyticsMethods | null>(null);

  if (analyticsRef.current === null) {
    analyticsRef.current = new Analytics(
      templateData,
      requireOptIn,
      pageDomain
    );
  }

  const analytics = analyticsRef.current;

  if (enableTrackingCookie) {
    analytics.enableTrackingCookie();
  }

  let enableDebuggingDefault = debuggingParamDetected();
  if (getRuntime().name === "node") {
    enableDebuggingDefault =
      enableDebuggingDefault || process.env?.NODE_ENV === "development";
  }
  analytics.setDebugEnabled(enableDebugging ?? enableDebuggingDefault);

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
