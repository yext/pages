import React from "react";
import classNames from "classnames";
import { BreadcrumbsProps } from "./types.js";
import { Link } from "../link/link.js";
import { getHref } from "../link/methods.js";
import "./breadcrumbs.css";

export interface BreadcrumbsPropsDefault extends BreadcrumbsProps {
  breadcrumbs: Array<{ slug: string; name: string }>;
}

/*
 * The 'Breadcrumbs' component renders a breadcrumbs style navigation bar
 *
 * @example
 * ```
 * <Breadcrumbs breadcrumbs={defaultTransformer(streamBreadcrumbs)} />
 * ```
 *
 * @param {[{name: string, slug: string}]} breadcrumbs
 *          List of {crumbName, crumbUrl}
 * @param {ReactElement | string} separator
 *          between each breadcrumb - defaults to '/', also accepts any HTML element (<svg>, <img>, etc)
 */
const Breadcrumbs = (props: BreadcrumbsPropsDefault) => {
  const { breadcrumbs, className, separator = "/" } = props;

  return (
    <>
    {breadcrumbs?.length && (
      <nav
        className={classNames("Breadcrumbs", className)}
        aria-label="Breadcrumb"
      >
        <ol className="Breadcrumbs-list">
          {breadcrumbs.map(({ name, slug }, idx) => {
            const isLast = idx === breadcrumbs.length - 1;

            return (
              <li className="Breadcrumbs-item" key={idx}>
                <Breadcrumb name={name} slug={isLast ? "" : slug} {...props} />
                {!isLast && (
                  <span className="Breadcrumbs-separator">{separator}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      )}
    </>
  );
};

interface BreadcrumbProps {
  name: string;
  slug?: string;
}

const Breadcrumb = (props: BreadcrumbProps) => {
  const { name, slug } = props;

  if (slug) {
    return (
      <Link className="Breadcrumbs-link Link--breadcrumbs" href={slug}>
        <span className="Breadcrumbs-label">{name}</span>
      </Link>
    );
  }

  return <span className="Breadcrumbs-label">{name}</span>;
};

export default Breadcrumbs;
