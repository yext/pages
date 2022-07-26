import { ImageType as Image } from "./Image";

const defaultBreakpoints = ["768px", "992px", "1200px"];

/*
 * getSrcSetFromSizes uses a default src and an array of sizes to automatically
 *    request correctly sized images from dynl
 * @param src - should be a dynl url, assumes that the last url path specifies
 *    dimensions (ex. "//dynl.mktgcdn.com/p/gBgP413rdgOK9CjEevRmRCURgUq2-YMuArO4zicBhAE/5760x2400.jpg")
 * @param sizes - Array<[breakpoint, size]> where 'breakpoint' is the viewport
 *    width to target, and 'size' is the image dimensions to request in the
 *    format `[width]x[height]` (must include width)
 */
const getSrcSetFromSizes = (
  src: string,
  sizes: Array<[string, string]>
): string => {
  const urlComponents = src.split("/");
  urlComponents.pop(); // remove the last part of the URL (which specifies dimensions)
  const urlNoDimensions = urlComponents.join("/");

  return sizes
    .map(([bp, sizes]) => {
      const [width, _] = sizes.split("x");
      if (!Number(width)) {
        throw new Error(`couldn't parse width as a number`);
      }
      return `${urlNoDimensions}/${width}x0.webp ${width}w`;
    })
    .join(", ");
};

/*
 * transformBpSizes uses defaultBreakpoints to create an array like `customSizes`
 *  from bpSizes which doesn't specify breakpoints.
 */
function transformBpSizes(
  bpSizes: [string, string, string]
): Array<[string, string]> {
  return defaultBreakpoints.map((bp, idx) => [bp, bpSizes[idx]]);
}

/*
 * addWidthToCustomSizes ensures the requested image dimensions in customSizes include a width.
 */
function addWidthToCustomSizes(
  imageField: Image,
  customSizes: Array<[string, string]>
): Array<[string, string]> {
  return customSizes.map(([bp, size]) => {
    const [requestedWidth, requestedHeight] = size.split("x");
    // Invalid dimensions, throw error
    const widthIsValid =
      requestedWidth === "" || isFinite(Number(requestedWidth));
    const heightIsValid =
      requestedHeight === "" || isFinite(Number(requestedHeight));
    if (!(widthIsValid && heightIsValid)) {
      throw new Error(
        "invalid height or width in dimensions, expected unitless [width]x[height]"
      );
    }

    // Width is specified, noop:
    if (Number(requestedWidth)) {
      return [bp, size];
    }

    // Only height is specified, manually calculate and prepend width:
    const derivedWidth =
      Number(requestedHeight) * (imageField.width / imageField.height);
    return [bp, `${derivedWidth}x${requestedHeight}`];
  });
}

/*
 * sizesArrayToString converts customSizes arrays to a string which can be used
 *  as the 'sizes' attribute on an HTML image element.
 */
function sizesArrayToString(sizesArray: Array<[string, string]>): string {
  return sizesArray
    .map(([bp, sizes]) => {
      const [width, _] = sizes.split("x");
      if (!Number(width)) {
        throw new Error(`couldn't parse width as a number`);
      }
      return `(max-width: ${bp}) ${width}px`;
    })
    .join(", ");
}

/*
 * getDefaultSrc returns the top level src from a Yext.Image
 */
const getDefaultSrc = (imageField: Image): string => {
  return imageField.url;
};

export {
  defaultBreakpoints,
  getSrcSetFromSizes,
  transformBpSizes,
  addWidthToCustomSizes,
  sizesArrayToString,
  getDefaultSrc,
};
