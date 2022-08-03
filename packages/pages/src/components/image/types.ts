import * as React from "react";

export type ThumbnailType = {
  height: number;
  width: number;
  url: string;
};

export type ImageType = {
  image: {
    height: number;
    width: number;
    url: string;
    thumbnails?: ThumbnailType[];
  },
};

export enum ImageLayout {
  /**
   * The the default layout if one is not specified. An image will be scaled down to fit the
   * container but not exceed the absolute size of the image.
   */
  INTRINSIC = "intrinsic",
  /**
   * Shows the image in a fixed size. `width` or `height` must be passed in. If both "width` and
   * `height` are passed in, but the aspect ratio does not match the aspect ratio of the image,
   * the image will be centered. This behavior can be adjusted using the `objectFit` and
   * `objectPosition` props of the `style` rpop.
   */
  FIXED = "fixed",
  /** Shows the image in a fixed aspect ratio. The `aspectRatio` prop must be provided. */
  ASPECT = "aspect",
  /** Always fills the image to 100% of the container's width. */
  FILL = "fill",
}

/**
 * The shape of the data passed directly to the different template functions with the
 * exception of the render function (getPath, getHeadConfig, etc).
 */
export type ImageProps = {
  /** The image field from Knowledge Graph. */
  image: ImageType;
  /** Overrides the className on the underlying img tag. */
  className?: string;
  /** The absolute width of the image. Only impacts if layout is set to "fixed". */
  width?: number;
  /** The absolute height of the image. Only impacts if layout is set to "fixed". */
  height?: number;
  /** The aspect ratio of the image. Only impacts if layout is set to "aspect". */
  aspectRatio?: number;
  /** Specifies how the image is rendered. */
  layout?: ImageLayout;
  /** A pass through react component that is displayed when the image is loading. */
  placeholder?: React.ReactNode;
  /** Pass through props that are on the native HTML img tag. The Image component may not work if src and/or srcsets are included. */
  imgOverrides?: Object;
  /** The pass through style of the underlying img tag. */
  style?: React.CSSProperties;
};
