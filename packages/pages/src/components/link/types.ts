/**
 * Constants for available link types.
 */
export const LinkType = {
  URL: "URL",
  Email: "Email",
  Phone: "Phone",
} as const;

/**
 * Type of link types that might be received from the platform.
 */
export type LinkType = typeof LinkType[keyof typeof LinkType];

/**
 * Type for CTA field
 * Note that when coming from the platform the label will always be a string
 * but ReactNode allows for more general usage.
 */
export interface CTA {
  link: string;
  label?: React.ReactNode;
  linkType?: LinkType;
}
