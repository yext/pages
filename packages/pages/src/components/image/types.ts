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
  };
};

export type ImageProps = {
  image: ImageType;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  layout?: "intrinsic" | "fixed" | "aspect" | "fill";
  placeholder?: React.ReactNode;
  imgOverrides?: Object;
  style?: React.CSSProperties;
};
