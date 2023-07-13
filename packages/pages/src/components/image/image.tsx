import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ImageProps, ImageLayout, ImageLayoutOption } from "./types.js";

const MKTGCDN_URL_REGEX =
  /(https?:\/\/a.mktgcdn.com\/p(?<env>-sandbox|-qa|-dev)?\/)(?<uuid>.+)\/(.*)/;

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
  layout = ImageLayoutOption.INTRINSIC,
  placeholder,
  imgOverrides,
  style = {},
  loading = "lazy",
}: ImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const imageData = "image" in image ? image.image : image;

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsImageLoaded(true);
    }
  }, []);

  validateRequiredProps(
    layout,
    imageData.width,
    imageData.height,
    width,
    height,
    aspectRatio
  );

  const imgWidth = Math.abs(imageData.width);
  const imgHeight = Math.abs(imageData.height);
  const imgUUID = getImageUUID(imageData.url);

  // The image is invalid, only try to load the placeholder
  if (!imgUUID) {
    return <>{placeholder != null && placeholder}</>;
  }

  const absWidth = width && width > 0 ? width : undefined;
  const absHeight = height && height > 0 ? height : undefined;

  const { src, imgStyle, widths } = handleLayout(
    layout,
    imgWidth,
    imgHeight,
    imgUUID,
    style,
    imageData.url,
    absWidth,
    absHeight,
    aspectRatio
  );

  // Generate Image Sourceset
  const srcSet: string = widths
    .map(
      (w) =>
        `${getImageUrl(
          imgUUID,
          w,
          (imgHeight / imgWidth) * w,
          imageData.url
        )} ${w}w`
    )
    .join(", ");

  // Generate Image Sizes
  const maxWidthBreakpoints = [640, 768, 1024, 1280, 1536];
  const sizes: string = widths
    .map((w, i) =>
      i === widths.length - 1
        ? `${w}px`
        : `(max-width: ${maxWidthBreakpoints[i]}px) ${w}px`
    )
    .join(", ");

  return (
    <>
      {!isImageLoaded && placeholder != null && placeholder}
      <img
        ref={imgRef}
        style={imgStyle}
        src={src}
        className={className}
        width={absWidth}
        height={absHeight}
        srcSet={srcSet}
        sizes={sizes}
        loading={loading}
        alt={imageData.alternateText || ""}
        {...imgOverrides}
      />
    </>
  );
};

// Checks if required props are passed in for the specified layout, if not, log a warning.
export const validateRequiredProps = (
  layout: ImageLayout,
  imgWidth: number,
  imgHeight: number,
  width?: number,
  height?: number,
  aspectRatio?: number
) => {
  if (imgWidth < 0) {
    console.warn(`Invalid image width: ${imgWidth}.`);
  }

  if (imgHeight < 0) {
    console.warn(`Invalid image height: ${imgHeight}.`);
  }

  if (layout == ImageLayoutOption.FIXED) {
    if (!width && !height) {
      console.warn(
        "Using fixed layout but neither width nor height is passed as props."
      );

      return;
    }

    if (width && width < 0) {
      console.warn(`Using fixed layout but width is invalid: ${width}.`);
    }

    if (height && height < 0) {
      console.warn(`Using fixed layout but height is invalid: ${height}.`);
    }

    return;
  }

  if (width || height) {
    console.warn(
      "Width or height is passed in but layout is not fixed. These will have no impact. If you want to have a fixed height or width then set layout to fixed."
    );
  }

  if (layout == ImageLayoutOption.ASPECT && !aspectRatio) {
    console.warn(
      "Using aspect layout but aspectRatio is not passed as a prop."
    );
  }
};

/**
 * Returns the UUID of an image given its url. Logs an error if the image url is invalid.
 */
export const getImageUUID = (url: string) => {
  const matches = url.match(MKTGCDN_URL_REGEX);

  if (!matches?.groups?.uuid) {
    console.error(`Invalid image url: ${url}.`);
    return "";
  }

  return matches.groups.uuid;
};

/**
 * Returns the environment suffix for a url's bucket, if present.
 */
export const getImageEnv = (url: string): string | undefined => {
  const matches = url.match(MKTGCDN_URL_REGEX);

  return matches?.groups?.env;
};

/**
 * Returns the image url given its uuid, width and height.
 */
export const getImageUrl = (
  uuid: string,
  width: number,
  height: number,
  imgUrl: string
) => {
  const env = getImageEnv(imgUrl);
  const bucket = env ? `p${env}` : "p";
  return `https://dynl.mktgcdn.com/${bucket}/${uuid}/${Math.round(
    width
  )}x${Math.round(height)}`;
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
  imgUrl: string,
  absWidth?: number,
  absHeight?: number,
  aspectRatio?: number
): { src: string; imgStyle: React.CSSProperties; widths: number[] } => {
  let widths: number[] = [100, 320, 640, 960, 1280, 1920];
  let src: string = getImageUrl(imgUUID, 500, 500, imgUrl);
  const imgStyle = { ...style };
  imgStyle.objectFit = imgStyle.objectFit || "cover";
  imgStyle.objectPosition = imgStyle.objectPosition || "center";

  switch (layout) {
    case ImageLayoutOption.INTRINSIC:
      // Don't let image be wider than its intrinsic width
      imgStyle.maxWidth = imgWidth;
      imgStyle.width = "100%";
      imgStyle.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    case ImageLayoutOption.FIXED: {
      const { fixedWidth, fixedHeight, fixedWidths } =
        getImageSizeForFixedLayout(
          imgWidth,
          imgHeight,
          widths,
          absWidth,
          absHeight
        );
      imgStyle.width = fixedWidth;
      imgStyle.height = fixedHeight;
      widths = fixedWidths;
      src = getImageUrl(imgUUID, fixedWidth, fixedHeight, imgUrl);

      break;
    }
    case ImageLayoutOption.ASPECT:
      imgStyle.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    case ImageLayoutOption.FILL:
      imgStyle.width = "100%";
      imgStyle.aspectRatio = aspectRatio
        ? `${aspectRatio}`
        : `${imgWidth} / ${imgHeight}`;

      break;
    default:
      console.warn(`Unrecognized layout: ${layout}.`);
      break;
  }

  return { src, imgStyle, widths };
};

// Returns the fixedWidth and fixedHeight for fixed layout
export const getImageSizeForFixedLayout = (
  imgWidth: number,
  imgHeight: number,
  defaultWidths: number[],
  absWidth?: number,
  absHeight?: number
): { fixedWidth: number; fixedHeight: number; fixedWidths: number[] } => {
  if (absWidth && absHeight) {
    return {
      fixedWidth: absWidth,
      fixedHeight: absHeight,
      fixedWidths: [absWidth],
    };
  }

  if (absWidth) {
    return {
      fixedWidth: absWidth,
      fixedHeight: (absWidth * imgHeight) / imgWidth,
      fixedWidths: [absWidth],
    };
  }

  if (absHeight) {
    return {
      fixedWidth: (absHeight / imgHeight) * imgWidth,
      fixedHeight: absHeight,
      fixedWidths: [(absHeight / imgHeight) * imgWidth],
    };
  }

  return {
    fixedWidth: imgWidth,
    fixedHeight: imgHeight,
    fixedWidths: defaultWidths,
  };
};
