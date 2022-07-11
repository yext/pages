/**
 * The configuration that allows users to entirely arbitarily
 * set the inner contents of the head element that will be
 * prepended to the generated HTML document.
 *
 * @public
 */
export interface HeadConfig {
  /** Title of the page. Will default to 'Yext Pages Site' if omitted. */
  title?: string;
  /** Declares the documents encoding. */
  charset?: string;
  /** Declares the size and shape of the documents viewport. */
  viewport?: string;
  /** Well-defined interface for adding HTML tags (such as meta tags) */
  tags?: Tag[];
  /** For any content that can't be fully encapsulted by our Tag interface,
   *  (i.e. template or style) an arbitrary, user-defined string can
   *  be provided.
   */
  other?: string;
}

/**
 * Custom type for specifying HTML element attributes in the {@link Tag}
 * interface.
 *
 * @public
 */
export type Attributes = Record<string, string>;

/**
 * Type that enumerates the allowed types of HTML elements in the document
 * header.
 *
 * @public
 */
export type TagType =
  | "base"
  | "link"
  | "style"
  | "meta"
  | "script"
  | "noscript"
  | "template";

/**
 * Interface for an HTML tag. Can set attributes on the tag, but
 * if a body needs to be defined, use the other field of the
 * {@link HeadConfig} interface.
 *
 * @public
 */
export interface Tag {
  /** The type of the element to create (i.e. meta, script, link, etc.) */
  type: TagType;
  /**
   * The attributes to add to the element. Each attribute will be added in
   * the form 'key="value"' and attributes will be seperated by a space
   */
  attributes: Attributes;
}

/**
 * Function that takes a {@link HeadConfig} interface and outputs a valid
 * string of HTML that will be inserted into the generated document between
 * the head tags.
 *
 * @public
 */
export const renderHeadConfigToString = (headConfig: HeadConfig): string => {
  return `<title>${
    headConfig.title ? headConfig.title : "Yext Pages Site"
  }</title>
    ${headConfig.charset ? `<meta charset="${headConfig.charset}">` : ""}
    ${
      headConfig.viewport
        ? `<meta name="viewport" content="${headConfig.viewport}">`
        : ""
    }
    ${headConfig.tags ? headConfig.tags.map(renderTag).join("\n") : ""}
    ${headConfig.other ? headConfig.other : ""}`
    .split("\n")
    .filter((line) => line.trim() != "")
    .join("\n");
};

// my test changes

const renderTag = (tag: Tag): string => {
  switch (tag.type) {
    case "base":
    case "link":
    case "meta":
      return `<${tag.type} ${renderAttributes(tag.attributes)}>`;
    case "style":
    case "script":
    case "noscript":
    case "template":
      return `<${tag.type} ${renderAttributes(tag.attributes)}></${tag.type}>`;
  }
};

const renderAttributes = (attributes: Attributes): string => {
  return Object.keys(attributes)
    .map((key) => {
      return `${key}="${attributes[key]}"`;
    })
    .join(" ");
};
