import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ImageProps, ImageLayout } from "./types";

/**
 * A component that renders an image. Here is an example of using the component with simple and
 * complex image fields from Knowledge Graph:
 * ```
 * import { Image } from "@yext/pages/components";
 *
 * const template = ({ document }) => {
 *   return (
 *     <div>
 *       <Image image={document.logo.image} />
 *       <Image image={document.photoGallery[0].image} />
 *     </div>
 *   );
 * }
 * ```
 *
 * `layout`, `imgOverrides` and `style` can be used to specify the style and behavior of the image.
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
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setImgLoaded(true);
    }
  }, []);

  if (layout != ImageLayout.FIXED && (width || height)) {
    console.warn(
      "Width or height is passed in but layout is not fixed. These will have no impact. If you want to have a fixed height or width then set layout to fixed."
    );
  }

  const imgWidth: number = image.width;
  const imgHeight: number = image.height;
  const imgUrlValid = !!image.url && image.url.split("/").length > 4;
  if (!imgUrlValid) {
    console.warn(`Invalid image url: ${image.url}.`);
  }
  const imgUUID: string = imgUrlValid ? image.url.split("/")[4] : "";

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

  return (
    <>
      {placeholder != null && !imgLoaded && placeholder}
      <img
        ref={imgRef}
        style={imgStyle}
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

const handleLayout = (
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
