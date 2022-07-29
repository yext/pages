import * as React from "react";

export type Thumbnail = {
  height: number;
  width: number;
  url: string;
};

export type Image = {
  height: number;
  width: number;
  url: string;
  thumbnails?: Thumbnail[];
};

export type Props = {
  image: Image;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  layout?: "intrinsic" | "fixed" | "aspect" | "fill";
  placeholder?: React.ReactNode;
  imgOverrides?: Object;
  style?: React.CSSProperties;
};
