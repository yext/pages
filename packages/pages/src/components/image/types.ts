import * as React from "react";

/**
 * The type definition for a thumbnail.
 *
 * @public
 */
export type ThumbnailType = {
  height: number;
  width: number;
  url: string;
};

/**
 * The type definition for a complex image.
 *
 * @public
 */
export type ComplexImageType = {
  image: {
    alternateText?: string;
    height: number;
    width: number;
    url: string;
    thumbnails?: ThumbnailType[];
  };
};

/**
 * The type definition for an image.
 *
 * @public
 */
export type ImageType = {
  alternateText?: string;
  height: number;
  width: number;
  url: string;
};

/**
 * Layout option on the Image component.
 *
 * @public
 */
export const ImageLayoutOption = {
  /**
   * The the default layout if one is not specified. An image will be scaled down to fit the
   * container but not exceed the absolute size of the image.
   */
  INTRINSIC: "intrinsic",
  /**
   * Shows the image in a fixed size. `width` or `height` must be passed in. If both "width` and
   * `height` are passed in, but the aspect ratio does not match the aspect ratio of the image,
   * the image will be centered. This behavior can be adjusted using the `objectFit` and
   * `objectPosition` props of the `style` rpop.
   */
  FIXED: "fixed",
  /** Shows the image in a fixed aspect ratio. The `aspectRatio` prop must be provided. */
  ASPECT: "aspect",
  /** Always fills the image to 100% of the container's width. */
  FILL: "fill",
} as const;

/**
 * The type definition for the image layout.
 *
 * @public
 */
export type ImageLayout =
  (typeof ImageLayoutOption)[keyof typeof ImageLayoutOption];

/**
 * The shape of the data passed to {@link Image}.
 */
interface BaseImageProps {
  /** The image field from Knowledge Graph. */
  image: ComplexImageType | ImageType;
  /** Overrides the className on the underlying img tag. */
  className?: string;
  /** Specifies how the image is rendered. */
  layout?: ImageLayout;
  /** The absolute width of the image. Only impacts if layout is set to "fixed". */
  width?: number;
  /** The absolute height of the image. Only impacts if layout is set to "fixed". */
  height?: number;
  /** The aspect ratio of the image. Only impacts if layout is set to "aspect". */
  aspectRatio?: number;
  /** A pass through react component that is displayed when the image is loading. */
  placeholder?: React.ReactNode;
  /** Pass through props that are on the native HTML img tag. The Image component may not work if src and/or srcsets are included. */
  imgOverrides?: Record<string, unknown>;
  /** The pass through style of the underlying img tag. */
  style?: React.CSSProperties;
  /** Set the loading state of the image. */
  loading?: "eager" | "lazy";
}

/**
 * The shape of the data passed to {@link Image} when layout is {@link ImageLayoutOption.INTRINSIC},
 * {@link ImageLayoutOption.FILL} or not provided.
 */
interface OtherImageProps extends BaseImageProps {
  /** Specifies how the image is rendered. */
  layout?: "intrinsic" | "fill";
}

/**
 * The shape of the data passed to {@link Image} when layout is {@link ImageLayoutOption.FIXED}.
 * Extends the {@link BaseImageProps} interface and has the additions of a width and height,
 * at least one of which must be specified.
 */
interface FixedImageProps extends BaseImageProps {
  /** Specifies how the image is rendered. */
  layout: "fixed";
  /** The absolute width of the image. Only impacts if layout is set to "fixed". */
  width?: number;
  /** The absolute height of the image. Only impacts if layout is set to "fixed". */
  height?: number;
}

/**
 * The shape of the data passed to {@link Image} when layout is {@link ImageLayoutOption.ASPECT}.
 * Extends the {@link BaseImageProps} interface and has the additions of a required aspectRatio.
 */
interface AspectImageProps extends BaseImageProps {
  /** Specifies how the image is rendered. */
  layout: "aspect";
  /** The aspect ratio of the image. Only impacts if layout is set to "aspect". */
  aspectRatio: number;
}

/**
 * The shape of the data passed to {@link Image}.
 *
 * @public
 */
export type ImageProps = OtherImageProps | FixedImageProps | AspectImageProps;
