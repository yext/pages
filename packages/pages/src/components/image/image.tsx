import * as React from "react";
import { useRef, useState } from "react";
import { Props } from "./types";

export const Image = ({
  image,
  className,
  width,
  height,
  aspectRatio,
  layout = "intrinsic",
  placeholder,
  imgOverrides,
  style,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  if (layout != "fixed" && (width || height)) {
    console.warn(
      "Width or height is passed in but layout is not fixed. These will have no impact. If you want to have a fixed height or width then set layout to fixed."
    );
  }

  const imgWidth: number = image.width;
  const imgHeight: number = image.height;
  const photoUUID: string = image.url.split("/")[4];

  if (style == null) {
    style = {
      objectFit: "cover",
      objectPosition: "center",
    };
  }

  let widths: number[] = [100, 320, 640, 960, 1280, 1920];
  let src: string = getImageUrl(photoUUID, 500, 500);

  switch (layout) {
    case "intrinsic":
      // Don't let image be wider than its intrinsic width
      style.maxWidth = imgWidth;
      style.width = "100%";

      if (aspectRatio) {
        style.aspectRatio = `${aspectRatio}`;
      } else {
        style.aspectRatio = `${imgWidth} / ${imgHeight}`;
      }

      break;
    case "fixed":
      if (!width && !height) {
        console.warn(
          "Using fixed layout but width and height are not passed as props."
        );
      }

      const fixedWidth = width
        ? width
        : height
        ? (height / imgHeight) * imgWidth
        : undefined;
      const fixedHeight = height
        ? height
        : width
        ? (width * imgHeight) / imgWidth
        : undefined;

      style.width = fixedWidth;
      style.height = fixedHeight;

      if (fixedWidth && fixedHeight) {
        src = getImageUrl(photoUUID, fixedWidth, fixedHeight);
      }

      widths = width
        ? [width]
        : height
        ? [(height / imgHeight) * imgWidth]
        : widths;

      break;
    case "aspect":
      if (!aspectRatio) {
        console.warn(
          "Using aspect layout but aspectRatio is not passed as a prop."
        );
      }

      if (aspectRatio) {
        style.aspectRatio = `${aspectRatio}`;
      } else {
        style.aspectRatio = `${imgWidth} / ${imgHeight}`;
      }

      break;
    case "fill":
      style.width = "100%";
      if (aspectRatio) {
        style.aspectRatio = `${aspectRatio}`;
      } else {
        style.aspectRatio = `${imgWidth} / ${imgHeight}`;
      }

      break;
    default:
  }

  // Generate Image Sourceset
  const srcSet: string = widths
    .map(
      (w) => `${getImageUrl(photoUUID, w, (imgHeight / imgWidth) * w)} ${w}w`
    )
    .join(", ");

  return (
    <div ref={ref} className="bg-gray-200 relative" style={style}>
      {/*<div className="absolute"></div>*/}
      {!imgLoaded && placeholder != null && placeholder}
      <img
        style={
          !imgLoaded && placeholder ? { ...style, display: "none" } : style
        }
        src={src}
        className={className}
        width={width}
        height={height}
        srcSet={srcSet}
        loading={"lazy"}
        onLoad={() => setImgLoaded(true)}
        {...imgOverrides}
      />
    </div>
  );
};

const getImageUrl = (uuid: string, width: number, height: number) => {
  return `https://dynl.mktgcdn.com/p/${uuid}/${Math.round(width)}x${Math.round(
    height
  )}`;
};
