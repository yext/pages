import React, { useState } from 'react';
import classNames from "classnames";
import { getHref, isEmail, reverse } from './methods';
import type { CTA } from "./types";


/**
 * Configuration options available for any usages of the Link component.
 */
interface LinkConfig extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  obfuscate?: boolean
}

/**
 * The shape of the data passed to {@link Link} when directly passing an HREF to the Link component.
 */
interface HREFLinkProps extends LinkConfig {
  href: string
  cta?: never
}

/**
 * The shape of the data passed to {@link Link} when using a CTA field, and not overriding children.
 */
interface CTAWithChildrenLinkProps extends LinkConfig {
  href?: never
  cta: CTA
  children?: never
}

/**
 * The shape of the data passed to {@link Link} when using a CTA field, and overriding children.
 */
interface CTAWithoutChildrenLinkProps extends LinkConfig {
  href?: never
  cta: Omit<CTA, 'label'>
  children: React.ReactNode
}

/**
 * The shape of the data passed to {@link Link} when using a CTA field.
 */
type CTALinkProps = CTAWithChildrenLinkProps | CTAWithoutChildrenLinkProps

/**
 * The shape of the data passed to {@link Link}.
 */
export type LinkProps = CTALinkProps | HREFLinkProps

/**
 * Type predicate for distinguishing between data cases.
 */
function isHREFProps(props: LinkProps): props is HREFLinkProps {
  return ("href" in props);
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
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {children, onClick, className, ...rest} = props;
  const link: CTA = isHREFProps(props)
    ? {link: props.href}
    : props.cta;

  const obfuscate = props.obfuscate || (props.obfuscate !== false && isEmail(link.link));
  const [humanInteraction, setHumanInteraction] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setHumanInteraction(true);
    if (onClick) onClick(e);
  }

  const useLinkAsLabel = !children && !link.label;
  const isObfuscate = !humanInteraction && obfuscate !== false;
  const obfuscatedStyle: React.CSSProperties = {
    ...props.style,
    unicodeBidi: 'bidi-override',
    direction: useLinkAsLabel && isObfuscate ? 'rtl' : 'ltr',
  };

  const renderedLink = isObfuscate ? reverse(link.link) : link.link;

  return (
    <a
      className={classNames("Link", className)}
      href={humanInteraction || !obfuscate ? getHref(link) : 'obfuscate'}
      onClick={(e) => handleClick(e)}
      rel={(props.target && !props.rel) ? 'noopener' : undefined}
      ref={ref}
      style={obfuscatedStyle}
      {...rest}
    >
      {children || link.label || renderedLink}
    </a>
  )
});