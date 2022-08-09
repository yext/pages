import { ReactNode } from 'react';
import { LinkType } from "./types";
import type { CTA } from "./types";

/**
 * Get the link from a CTA
 * 
 * @param {CTA} cta
 *
 * @returns {string}
 */
const getHref = (cta: CTA): string => {
  if (cta.linkType === 'Email' || (!cta.linkType && isEmail(cta.link))) {
    return `mailto:${cta.link}`;
  }

  if (cta.linkType === 'Phone') {
    return `tel:${cta.link}`;
  }

  return cta.link;
}

/**
 * CTA constructor
 * 
 * @param {string} link
 * @param {LinkType} linkType
 * @param {string} label
 *
 * @returns {boolean}
 */
export function cta(link: string, linkType: LinkType = LinkType.URL, label?: ReactNode): CTA {

  
  return {
    link,
    linkType: linkType,
    label: typeof label === 'string' ? label : '',
  }
}

/**
 * Checks if is a valid email address
 * 
 * Regex defined in HTML Spec for <input type="email"> validation.
 * https://html.spec.whatwg.org/#email-state-(type=email)
 */
const isEmail = (string: string): boolean => {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(string);
}

/**
 * Reverse a string, used for obfuscation
 * 
 * https://eddmann.com/posts/ten-ways-to-reverse-a-string-in-javascript/
 */
const reverse = (string: string): string => {
  let o = '';
  for (let i = string.length - 1; i >= 0; o += string[i--]) { 
    // intentionally empty, logic happens in the for loop iteration
  }
  return o;
}

export {
  getHref,
  isEmail,
  reverse,
}
