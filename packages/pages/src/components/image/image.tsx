import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { ImageProps } from "./types";

export const Image = ({
  image,
  className,
  width,
  height,
  aspectRatio,
  layout = "intrinsic",
  placeholder,
  imgOverrides,
  style = {},
}: ImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setImgLoaded(true);
    }
  }, []);

  if (layout != "fixed" && (width || height)) {
    console.warn(
      "Width or height is passed in but layout is not fixed. These will have no impact. If you want to have a fixed height or width then set layout to fixed."
    );
  }

  const imgWidth: number = image.image.width;
  const imgHeight: number = image.image.height;
  const imgUUID: string = image.image.url.split("/")[4];

  style.objectFit = style.objectFit || "cover";
  style.objectPosition = style.objectPosition || "center";

  let widths: number[] = [100, 320, 640, 960, 1280, 1920];
  let src: string = getImageUrl(imgUUID, 500, 500);

  switch (layout) {
    case "intrinsic":
      // Don't let image be wider than its intrinsic width
      style.maxWidth = imgWidth;
      style.width = "100%";
      style.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

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
        src = getImageUrl(imgUUID, fixedWidth, fixedHeight);
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

      style.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    case "fill":
      style.width = "100%";
      style.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    default:
  }

  // Generate Image Sourceset
  const srcSet: string = widths
    .map((w) => `${getImageUrl(imgUUID, w, (imgHeight / imgWidth) * w)} ${w}w`)
    .join(", ");

  return (
    <>
      {placeholder != null && !imgLoaded && placeholder}
      <img
        ref={imgRef}
        style={style}
        src={src}
        className={className}
        width={width}
        height={height}
        srcSet={srcSet}
        loading={"lazy"}
        onLoad={() => setImgLoaded(true)}
        {...imgOverrides}
      />
    </>
  );
};

const getImageUrl = (uuid: string, width: number, height: number) => {
  return `https://dynl.mktgcdn.com/p/${uuid}/${Math.round(width)}x${Math.round(
    height
  )}`;
};
