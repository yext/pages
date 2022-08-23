import { createContext } from "react";
import { AnalyticsMethods } from "./interfaces";

/**
 * Default react context for use with Yext Analytics.
 *
 * @public
 */
export const AnalyticsContext = createContext<AnalyticsMethods | null>(null);
