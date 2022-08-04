import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ImageProps, ImageLayout } from "./types";

const MKTGCDN_URL_REGEX =
  /((?<=^http:\/\/a\.mktgcdn\.com\/p\/)|(?<=^https:\/\/a\.mktgcdn\.com\/p\/)).+(?=\/(.*)$)/g;
enum imgLoadingStatus {
  NONE = "none",
  LOADED = "loaded",
  ERROR = "error",
}

/**
 * Renders an image based from the Yext Knowledge Graph. Example of using the component to render
 * simple and complex image fields from Yext Knowledge Graph:
 * ```
 * import { Image } from "@yext/pages/components";
 *
 * const simpleImage = (<Image image={document.logo} />);
 * const complexImage = (<Image image={document.photoGallery[0]} />);
 * ```
 *
 * @public
 */
export const Image = ({
  image,
  className,
  width,
  height,
  aspectRatio,
  layout = ImageLayout.INTRINSIC,
  placeholder,
  imgOverrides,
  style = {},
}: ImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgStatus, setImgStatus] = useState<imgLoadingStatus>(
    imgLoadingStatus.NONE
  );

  useEffect(() => {
    if (imgRef.current?.complete) {
      setImgStatus(imgLoadingStatus.LOADED);
    }
  }, []);

  if (layout != ImageLayout.FIXED && (width || height)) {
    console.warn(
      "Width or height is passed in but layout is not fixed. These will have no impact. If you want to have a fixed height or width then set layout to fixed."
    );
  }

  const imgWidth: number = image.image.width;
  const imgHeight: number = image.image.height;
  const imgUUID = getImageUUID(image.image.url);

  const { src, imgStyle, widths } = handleLayout(
    layout,
    imgWidth,
    imgHeight,
    imgUUID,
    style,
    width,
    height,
    aspectRatio
  );

  // Generate Image Sourceset
  const srcSet: string = widths
    .map((w) => `${getImageUrl(imgUUID, w, (imgHeight / imgWidth) * w)} ${w}w`)
    .join(", ");

  const onError = () => {
    setImgStatus(imgLoadingStatus.ERROR);
    console.warn(`Invalid image src: ${src}.`);
  };

  return (
    <>
      {placeholder != null &&
        imgStatus != imgLoadingStatus.LOADED &&
        placeholder}
      {imgStatus != imgLoadingStatus.ERROR && (
        <img
          ref={imgRef}
          style={imgStyle}
          src={src}
          className={className}
          width={width}
          height={height}
          srcSet={srcSet}
          loading={"lazy"}
          onLoad={() => setImgStatus(imgLoadingStatus.LOADED)}
          onError={() => onError()}
          {...imgOverrides}
        />
      )}
    </>
  );
};

/**
 * Returns the UUID of an image given its url. Logs a warning message if the image url is invalid.
 */
export const getImageUUID = (url: string) => {
  const matches = url.match(MKTGCDN_URL_REGEX);

  if (matches == null || matches.length == 0) {
    console.warn(`Invalid image url: ${url}.`);
    return "";
  }

  return matches[0];
};

/**
 * Returns the image url given its uuid, width and height.
 */
export const getImageUrl = (uuid: string, width: number, height: number) => {
  return `https://dynl.mktgcdn.com/p/${uuid}/${Math.round(width)}x${Math.round(
    height
  )}`;
};

/**
 * Returns the src, imgStyle and widths that will be set on the underlying img tag based on the
 * layout.
 */
export const handleLayout = (
  layout: ImageLayout,
  imgWidth: number,
  imgHeight: number,
  imgUUID: string,
  style: React.CSSProperties,
  width?: number,
  height?: number,
  aspectRatio?: number
): { src: string; imgStyle: React.CSSProperties; widths: number[] } => {
  let widths: number[] = [100, 320, 640, 960, 1280, 1920];
  let src: string = getImageUrl(imgUUID, 500, 500);
  style.objectFit = style.objectFit || "cover";
  style.objectPosition = style.objectPosition || "center";

  switch (layout) {
    case ImageLayout.INTRINSIC:
      // Don't let image be wider than its intrinsic width
      style.maxWidth = imgWidth;
      style.width = "100%";
      style.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    case ImageLayout.FIXED:
      if (!width && !height) {
        console.warn(
          "Using fixed layout but width and height are not passed as props."
        );
      }

      const fixedWidth = width
        ? width
        : height
        ? (height / imgHeight) * imgWidth
        : imgWidth;
      const fixedHeight = height
        ? height
        : width
        ? (width * imgHeight) / imgWidth
        : imgHeight;

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
    case ImageLayout.ASPECT:
      if (!aspectRatio) {
        console.warn(
          "Using aspect layout but aspectRatio is not passed as a prop."
        );
      }

      style.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    case ImageLayout.FILL:
      style.width = "100%";
      style.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    default:
      console.warn(`Unrecognized layout: ${layout}.`);
      break;
  }

  return { src, imgStyle: style, widths };
};
