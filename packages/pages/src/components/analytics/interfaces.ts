import { MouseEvent } from "react";
import { ConversionDetails, Visitor } from "@yext/analytics";
import { TemplateProps } from "../../common/src/template/types.js";

/**
 * The AnalyticsMethod interface specifies the methods that can be used with
 * the Analytics Provider.
 *
 */
export interface AnalyticsMethods {
  /**
   * The track method will send a generic analytics event to Yext.
   *
   * @param eventName - the name of the event, will appear in Yext's Report Builder UI
   * @param conversionData - optional details for tracking an event as a conversion
   */
  track(eventName: string, conversionData?: ConversionDetails): Promise<void>;

  /**
   * The identify method will allow you to tie analytics events to a specific user.
   *
   * @param visitor - the Visitor object
   */
  identify(visitor: Visitor): void;

  /**
   * The pageView method will track a pageview event.
   */
  pageView(): Promise<void>;

  /**
   * trackClick will return an event handler that delays navigation to allow
   * a click event to send.  To use it you simply pass it to the onClick prop,
   * like so: <a onClick={trackClick('my click')}>
   */
  trackClick(
    eventName: string,
    conversionData?: ConversionDetails
  ): (e: MouseEvent<HTMLAnchorElement>) => Promise<void>;

  /**
   * The optIn method should be called when a user opts into analytics tracking,
   * e.g. via a Consent Management Banner or other opt-in method.
   */
  optIn(): Promise<void>;

  /**
   * Use the enableTrackingCookie method to enable conversion tracking on
   * your page.  This should be done only if you have conversion tracking
   * configured in your Yext account.
   */
  enableTrackingCookie(): void;

  /**
   * Use the setDebugEnabled method to toggle debugging on or off. Currently,
   * this will log tracked events to the dev console.
   *
   * @param enabled - boolean value for whethere debugging should be on or off.
   */
  setDebugEnabled(enabled: boolean): void;
}

/**
 * The AnalyticsProviderProps interface represents the component properties
 * to be passed into the AnalyticsProvider.
 *
 * @public
 */
export interface AnalyticsProviderProps {
  /**
   * The TemplateProps that come from the rendering system
   */
  templateData: TemplateProps;

  /**
   * requireOptIn should be set to true if your compliance requirements require
   * you to put all marketing analytics behind a user opt-in banner or if you
   * use a Compliance Management tool of some kind.
   */
  requireOptIn?: boolean | undefined;

  /**
   * enableTrackingCookie will set a tracking cookie when a user does any
   * trackable action on your site, such as a page view, click, etc.
   */
  enableTrackingCookie?: boolean | undefined;

  /**
   * enableDebugging can be set to true if you want to expose tracked events
   * in the developer console.
   */
  enableDebugging?: boolean | undefined;

  /**
   * The domain of the page to send with API requests. If none is specified,
   * the hostname for the site ID is used. The domain string must include the
   * scheme (e.g. https://foo.com).
   */
  pageDomain?: string;
}

/**
 * AnalyticsScopeProps defines the component properties required by the
 * AnalyticsScopeProvider component.
 *
 * @public
 */
export interface AnalyticsScopeProps {
  /**
   * The string to prepend to all analytics events that come from components
   * below the AnalyticsScopeProvider component in the tree.
   */
  name: string;
}
