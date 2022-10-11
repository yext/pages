import { ConversionDetails } from "@yext/analytics";
import React, { useState } from "react";
import classNames from "classnames";
import { useAnalytics } from "../analytics/index.js";
import { getHref, isEmail, reverse } from "./methods.js";
import type { CTA } from "./types.js";

/**
 * Configuration options available for any usages of the Link component.
 *
 * @public
 */
interface LinkConfig
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  obfuscate?: boolean;
  eventName?: string;
  conversionDetails?: ConversionDetails | undefined;
}

/**
 * The shape of the data passed to {@link Link} when directly passing an HREF to the Link component.
 */
export interface HREFLinkProps extends LinkConfig {
  href: string;
  cta?: never;
}

/**
 * The shape of the data passed to {@link Link} when using a CTA field, and not overriding children.
 */
export interface CTAWithChildrenLinkProps extends LinkConfig {
  href?: never;
  cta: CTA;
  children?: never;
}

/**
 * The shape of the data passed to {@link Link} when using a CTA field, and overriding children.
 *
 * @public
 */
export interface CTAWithoutChildrenLinkProps extends LinkConfig {
  href?: never;
  cta: Omit<CTA, "label">;
  children: React.ReactNode;
}

/**
 * The shape of the data passed to {@link Link} when using a CTA field.
 *
 * @public
 */
type CTALinkProps = CTAWithChildrenLinkProps | CTAWithoutChildrenLinkProps;

/**
 * The shape of the data passed to {@link Link}.
 *
 * @public
 */
export type LinkProps = CTALinkProps | HREFLinkProps;

/**
 * Type predicate for distinguishing between data cases.
 */
function isHREFProps(props: LinkProps): props is HREFLinkProps {
  return "href" in props;
}

/**
 * Renders an anchor tag using either a directly provided HREF or from a field in the Yext Knowledge Graph.
 *
 * Example of using the component to render
 * a link with and without sourcing from a knowledge graph field:
 *
 * @example
 * ```
 * import { Link } from "@yext/pages/components";
 *
 * <Link href="/search">Locator</Link>
 * <Link cta={document.c_exampleCTA} />
 * <Link cta={{link: "https://www.yext.com", label: "Click Here", linkType: "URL"}} />
 *
 * @public
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(props, ref) {
    const link: CTA = isHREFProps(props) ? { link: props.href } : props.cta;
    const { children, onClick, className, eventName, cta, ...rest } = props;

    const trackEvent = eventName ? eventName : cta ? "cta" : "link";
    const analytics = useAnalytics();

    const obfuscate =
      props.obfuscate || (props.obfuscate !== false && isEmail(link.link));
    const [humanInteraction, setHumanInteraction] = useState<boolean>(false);

    const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      setHumanInteraction(true);
      if (analytics !== null) {
        await analytics.trackClick(trackEvent, props.conversionDetails)(e);
      }

      if (onClick) {
        onClick(e);
      }
    };

    const useLinkAsLabel = !children && !link.label;
    const isObfuscate = !humanInteraction && obfuscate;
    const obfuscatedStyle: React.CSSProperties = {
      ...props.style,
      unicodeBidi: "bidi-override",
      direction: useLinkAsLabel && isObfuscate ? "rtl" : "ltr",
    };

    const renderedLink = isObfuscate ? reverse(link.link) : link.link;

    return (
      <a
        className={classNames("Link", className)}
        href={humanInteraction || !obfuscate ? getHref(link) : "obfuscate"}
        onClick={handleClick}
        rel={props.target && !props.rel ? "noopener" : undefined}
        ref={ref}
        style={obfuscatedStyle}
        {...rest}
      >
        {children || link.label || renderedLink}
      </a>
    );
  }
);
