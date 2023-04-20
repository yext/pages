import { LinkProps, HREFLinkProps, CTA } from "./types.js";

/**
 * Get the link from a CTA
 *
 * @param {CTA} cta
 *
 * @returns {string}
 */
const getHref = (cta: CTA): string => {
  if (cta.linkType === "Email" || (!cta.linkType && isEmail(cta.link))) {
    return `mailto:${cta.link}`;
  }

  if (cta.linkType === "Phone") {
    return `tel:${cta.link}`;
  }

  return cta.link;
};

/**
 * Checks if is a valid email address
 *
 * Regex defined in HTML Spec for <input type="email"> validation.
 * https://html.spec.whatwg.org/#email-state-(type=email)
 */
const isEmail = (string: string): boolean => {
  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(string);
};

/**
 * Reverse a string, used for obfuscation
 *
 * https://eddmann.com/posts/ten-ways-to-reverse-a-string-in-javascript/
 */
const reverse = (string: string): string => {
  let o = "";
  for (let i = string.length - 1; i >= 0; o += string[i--]) {
    // intentionally empty, logic happens in the for loop iteration
  }
  return o;
};

/**
 * Type predicate for distinguishing between data cases.
 */
const isHREFProps = (props: LinkProps): props is HREFLinkProps => {
  return "href" in props;
};

export { getHref, isEmail, isHREFProps, reverse };
