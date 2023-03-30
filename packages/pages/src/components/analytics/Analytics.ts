import { MouseEvent } from "react";
import { TemplateProps } from "../../common/src/template/types.js";
import { getRuntime, isProduction } from "../../util/index.js";
import { AnalyticsMethods } from "./interfaces.js";
import {
  ConversionDetails,
  CookieManager,
  EntityPage,
  PagesAnalyticsService,
  providePagesAnalytics,
  StaticPage,
  Visitor,
} from "@yext/analytics";
import { slugify } from "./helpers.js";

/**
 * The Analytics class creates a stateful facade in front of the \@yext/analytics
 * Library's pagesAnalyticsProvider class. It takes in some data from the
 * template configuration and uses it to provide configuration to the
 * pagesAnalyticsProvider.
 *
 * Additionally, it provides handlers for controlling user opt-in for compliance
 * requirements as well as for debugging, enabling conversion tracking, saving
 * user identity information, and creating named analytics scopes for
 * easy tagging.
 *
 * @public
 */
export class Analytics implements AnalyticsMethods {
  private _optedIn: boolean;
  private _conversionTrackingEnabled = false;
  private _cookieManager: CookieManager | undefined;
  private _analyticsReporter: PagesAnalyticsService | undefined;
  private _pageViewFired = false;
  private _enableDebugging = false;

  /**
   * Creates an Analytics instance, will fire a pageview event if requireOptin
   * is false
   *
   * @param templateData - template data object from the pages system
   * @param requireOptIn - boolean, set to true if you require user opt in before tracking analytics
   */
  constructor(
    private templateData: TemplateProps,
    requireOptIn?: boolean | undefined,
    private pageDomain?: string
  ) {
    this._optedIn = !requireOptIn;
    this.makeReporter();
    this.pageView();
  }

  private calculatePageType(): EntityPage | StaticPage {
    const isStaticPage = !!this.templateData.document?.__?.staticPage;
    const isEntityPage = !!this.templateData.document?.__?.entityPageSet;

    let pageType: EntityPage | StaticPage;

    if (isStaticPage) {
      pageType = {
        name: "static",
        staticPageId: this.templateData.document.__.name as string,
      };
    } else if (isEntityPage) {
      pageType = {
        name: "entity",
        pageSetId: this.templateData.document.__.name as string,
        id: this.templateData.document.uid as number,
      };
    } else {
      throw new Error("invalid document type");
    }

    return pageType;
  }

  private makeReporter() {
    if (getRuntime().name !== "browser") {
      return;
    }
    if (!this._optedIn) {
      return;
    }

    const inProduction =
      isProduction(this.templateData?.document?.siteInternalHostName) ||
      isProduction(this.templateData?.document?.siteDomain);

    this._analyticsReporter = providePagesAnalytics({
      businessId: this.templateData.document.businessId as number,
      pageType: this.calculatePageType(),
      pageUrl: window.location.href,
      production: inProduction,
      referrer: document.referrer,
      siteId: this.templateData.document.siteId as number,
      pageDomain: this.pageDomain,
    });

    this.setDebugEnabled(this._enableDebugging);
  }

  private canTrack(): boolean {
    return (
      getRuntime().name === "browser" &&
      this._optedIn &&
      !!this._analyticsReporter
    );
  }

  private setupConversionTracking(): void {
    this._cookieManager = new CookieManager();
    this._analyticsReporter?.setConversionTrackingEnabled(
      true,
      this._cookieManager.setAndGetYextCookie()
    );
  }

  /** {@inheritDoc AnalyticsMethods.enableConversionTracking} */
  enableTrackingCookie(): void {
    this._conversionTrackingEnabled = true;

    if (this.canTrack()) {
      this.setupConversionTracking();
    }
  }

  /** {@inheritDoc AnalyticsMethods.identify} */
  identify(visitor: Visitor): void {
    if (this.canTrack()) {
      this._analyticsReporter?.setVisitor(visitor);
    }
  }

  /** {@inheritDoc AnalyticsMethods.async} */
  async optIn(): Promise<void> {
    this._optedIn = true;
    this.makeReporter();
    if (this._conversionTrackingEnabled && !this._cookieManager) {
      this.setupConversionTracking();
    }
    if (!this._pageViewFired) {
      await this.pageView();
    }
  }

  /** {@inheritDoc AnalyticsMethods.async} */
  async pageView(): Promise<void> {
    if (!this.canTrack()) {
      return Promise.resolve(undefined);
    }
    // TODO: if this successfully completes & conversion tracking is enabled
    // and the user is opted in we should remove the y_source query parameter
    // from the url if it is present to prevent double counting a listings click
    // if the page is refreshed.
    await this._analyticsReporter?.pageView();
    this._pageViewFired = true;
  }

  /** {@inheritDoc AnalyticsMethods.track} */
  async track(
    eventName: string,
    conversionData?: ConversionDetails
  ): Promise<void> {
    if (!this.canTrack()) {
      return Promise.resolve();
    }

    await this._analyticsReporter?.track(
      { eventType: slugify(eventName) },
      conversionData
    );
  }

  /** {@inheritDoc AnalyticsMethods.setDebugEnabled} */
  setDebugEnabled(enabled: boolean): void {
    this._enableDebugging = enabled;
    this._analyticsReporter?.setDebugEnabled(enabled);
  }

  /** {@inheritDoc AnalyticsMethods.trackClick} */
  trackClick(
    eventName: string,
    conversionData?: ConversionDetails
  ): (e: MouseEvent<HTMLAnchorElement>) => Promise<void> {
    return (e: MouseEvent) => {
      if (!this.canTrack()) {
        return Promise.resolve();
      }

      if (e.target === null || e.defaultPrevented) {
        return this.track(eventName, conversionData);
      }

      const targetLink = e.target as HTMLAnchorElement;

      if (targetLink.href === null || targetLink.href === undefined) {
        return this.track(eventName, conversionData);
      }

      const linkUrl = new URL(targetLink.href);

      if (
        linkUrl.protocol === "mailto:" ||
        linkUrl.protocol === "tel:" ||
        linkUrl.protocol === "javascript:" ||
        linkUrl.hostname === window.location.hostname
      ) {
        return this.track(eventName, conversionData);
      }

      const targetBlankOrSimilar =
        (targetLink.target &&
          !targetLink.target.match(/^_(self|parent|top)$/i)) ||
        e.ctrlKey ||
        e.shiftKey ||
        e.metaKey;

      if (targetBlankOrSimilar) {
        return this.track(eventName, conversionData);
      }

      e.preventDefault();

      const navigate = () => {
        window.location.assign(linkUrl);
      };

      const awaitTimeout = new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      return Promise.race([this.track(eventName, conversionData), awaitTimeout])
        .then(navigate)
        .catch(navigate);
    };
  }
}
