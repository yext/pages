import React from "react";
import {
  transformBpSizes,
  getSrcSetFromSizes,
  getDefaultSrc,
  sizesArrayToString,
  addWidthToCustomSizes,
} from "./methods";
import { StandardProps } from "../types";
import { AspectRatio } from "../AspectRatio";

export interface ImageType {
  height: number;
  width: number;
  url: string;
}

export interface ImagePropsShared
  extends React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    StandardProps {
  bpSizes?: [string, string, string];
  customSizes?: Array<[string, string]>;
  layout?: "fixed" | "constrained" | "full-width";
  aspectRatio?: number;
  objectFit?: React.CSSProperties["objectFit"];
  objectPosition?: React.CSSProperties["objectPosition"];
  maxWidth?: number;
  width?: number;
  height?: number;
  /**
   Options: blurred, dominantColor, or none
   */
  placeholder?: string;
}

export interface ImagePropsWithSrc extends ImagePropsShared {
  src: string;
  imageField?: never;
}

export interface ImagePropsWithField extends ImagePropsShared {
  src?: never;
  imageField: ImageType;
}

export type ImageProps = ImagePropsWithSrc | ImagePropsWithField;

/**
 * The 'Image' component is used to render an HTML <image> element
 *
 * @example
 * ```
 * <Image src="https://via.placeholder.com/400x600" />
 * <Image imageField={profile.c_heroImage} />
 * <Image imageField={profile.c_heroImage} bpSizes={['400x, '600x400', 'x800']} />
 * ```
 *
 * @param {ImageType} imageField
 *          Yext Image field, used to generate `src` (and `srcSet`, `sizes` if [bpSizes | customSizes] are specified).
 * @param {[string, string, string]} bpSizes
 *          Size of requested image at breakpoints [sm, md, lg]. Size in pixels should be unitless in the format `[width]x[height]` ex. `400x600` `400x` `x600`
 * @param {[[string, string]]} customSizes
 *          Expects format `[[bp, size], ['600px', '300x400'], ...]`.  Like bpSizes, but you can define the breakpoints yourself.
 * @param {string} src
 *          HTML attribute. This overrides the generated value from imageField.
 * @param {string} srcSet
 *          HTML attribute. This overrides the generated value from [bpSizes | customSizes].
 * @param {string} sizes
 *          HTML attribute. This overrides the generated value from [bpSizes | customSizes].
 * @param {string} alt
 *          HTML attribute. Defaults to empty string
 * @param {string} loading
 *          HTML attribute. Defaults to 'lazy'
 * @param {string} layout
 *          The size of the image and its resizing behavior. "fixed" | "constrained" | "full-width" are supported. Defaults to 'contrained'
 * @param {string} aspectRatio
 *          Should be 'height / width'.
 *          Some common aspect ratios:
 *            1:1 = 1.0, 4:3 = 0.75, 16:9 = 0.5625
 * @param {number} width
 * @param {number} height
 * @param {number} maxWidth
 * @param {string} objectFit
 *          CSS property sets how the content of a replaced element. Defaults to "cover"
 * @param {string} objectPosition
 *          CSS property specifies the alignment of the selected replaced element's contents within the element's box. Defaults to "center"
 * @param {string} placeholder
 *
 * @returns {Image}
 */
const Image = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  const {
    imageField,
    bpSizes,
    customSizes,
    layout = "contrained",
    aspectRatio,
    objectFit = "cover",
    objectPosition = "center",
    width,
    height,
    maxWidth,
    placeholder,
    src,
    srcSet,
    sizes,
    alt = "",
    loading = "lazy",
    ...rest
  } = props;

  // One of `src`, `imageField` is required to be populated in props, so manually
  //    casting imageField as `imageType` here to ignore typescript type checking
  const _src = src || getDefaultSrc(imageField as ImageType);

  // `_sizes` and `_srcSet` could be undefined because if you set an attribute
  //    like `sizes=undefined`, react will omit that HTML attribute
  let sizesArr: Array<[string, string]> = [];
  let derivedSizes: string | undefined;
  let derivedSrcSet: string | undefined;

  if (imageField) {
    sizesArr = customSizes || (bpSizes ? transformBpSizes(bpSizes) : sizesArr);
    sizesArr = addWidthToCustomSizes(imageField, sizesArr);
    if (sizesArr && sizesArr.length > 0) {
      derivedSizes = sizesArrayToString(sizesArr);
      derivedSrcSet = getSrcSetFromSizes(imageField.url, sizesArr);
    }
  }

  const _sizes = sizes || derivedSizes;
  const _srcSet = srcSet || derivedSrcSet;

  const style: React.CSSProperties = {
    objectFit,
    objectPosition,
  };

  if (layout == "fixed") {
    if (!width && !height) {
      console.warn(
        "Fixed layout requires width and height to be passed as props"
      );
    }
  }

  const fixedWidth = width ? width : height;
  const fixedHeight = height ? height : width;

  if (layout == "constrained" && (maxWidth || width)) {
    style.maxWidth = maxWidth || width;
    style.width = "100%";
  } else if (layout == "full-width") {
    style.width = "100%";
  } else if (layout == "fixed" && fixedWidth && fixedHeight) {
    style.width = fixedWidth;
    style.height = fixedHeight;
  }

  const img = (
    <img
      ref={ref}
      className="Image"
      src={_src}
      srcSet={_srcSet}
      sizes={_sizes}
      alt={alt || ""}
      loading={loading || "lazy"}
      style={style}
      {...rest}
    />
  );

  return (
    <div className="Image-wrapper">
      {aspectRatio ? (
        <AspectRatio ratio={aspectRatio} maxWidth={width} children={img} />
      ) : (
        img
      )}
    </div>
  );
});

export default Image;