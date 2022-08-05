/**
 * @jest-environment jsdom
 */
import React from "react";
import {
  Image,
  validateRequiredProps,
  getImageUUID,
  handleLayout,
  getImageSizeForFixedLayout,
} from "./image";
import { ImageLayout } from "./types";
import { render, screen } from "@testing-library/react";

const imgWidth = 20;
const imgHeight = 10;
const imgUUID = "uuid";
const width = 200;
const height = 100;
const widths = [100, 200, 300];
const aspectRatio = 1;
const image = {
  image: {
    width: imgWidth,
    height: imgHeight,
    url: `https://a.mktgcdn.com/p/${imgUUID}/2x1.jpg`,
  },
};

describe("Image", () => {
  it("properly renders the image with the pass through style and imgOverrides", () => {
    const overrideSrc = "https://overridesrc/";
    const overrideObjectFit = "none";

    render(
      <Image
        image={image}
        layout={ImageLayout.FIXED}
        width={width}
        style={{ objectFit: overrideObjectFit }}
        imgOverrides={{ src: overrideSrc }}
      />
    );

    expect(screen.getByRole("img").style.objectFit).toEqual(overrideObjectFit);
    expect(screen.getByRole("img")).toHaveProperty("src", overrideSrc);
  });

  it("properly renders the placeholder before the image is loaded", async () => {
    const placeholderText = "Placeholder";
    const placeholder = <div>{placeholderText}</div>;
    const onLoad = jest.fn();

    render(
      <Image
        image={image}
        placeholder={placeholder}
        imgOverrides={{ onLoad: () => onLoad() }}
      />
    );

    expect(screen.getByText(placeholderText)).toBeTruthy();
  });

  it("properly renders the placeholder if image's UUID is invalid and a placeholder is provided", async () => {
    const placeholderText = "Placeholder";
    const placeholder = <div>{placeholderText}</div>;

    const logMock = jest.spyOn(console, "error").mockImplementation(() => {});
    const invalidUrl = "https://a.mktgcdn.com/p/2x1.jpg";

    expect(logMock.mock.calls.length).toBe(0);

    render(
      <Image
        image={{
          image: { ...image.image, url: invalidUrl },
        }}
        placeholder={placeholder}
      />
    );

    expect(screen.getByText(placeholderText)).toBeTruthy();
    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(`Invalid image url: ${invalidUrl}.`);

    jest.clearAllMocks();
  });

  it("renders nothing if image's UUID is invalid and a placeholder is not provided", async () => {
    const logMock = jest.spyOn(console, "error").mockImplementation(() => {});
    const invalidUrl = "https://a.mktgcdn.com/p/2x1.jpg";

    expect(logMock.mock.calls.length).toBe(0);
    render(
      <Image
        image={{
          image: { ...image.image, url: invalidUrl },
        }}
      />
    );

    expect(screen.queryByRole("img")).toBeNull();
    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(`Invalid image url: ${invalidUrl}.`);

    jest.clearAllMocks();
  });
});

describe("getImageUUID", () => {
  it("properly extracts the image UUID", () => {
    expect(
      getImageUUID(
        "http://a.mktgcdn.com/p/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg"
      )
    ).toBe("EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54");
    expect(
      getImageUUID(
        "https://a.mktgcdn.com/p/ob40t_wP5WDgMN16PKEBrt8gAYyKfev_Hl1ahZPlGJo/1300x872.jpg"
      )
    ).toBe("ob40t_wP5WDgMN16PKEBrt8gAYyKfev_Hl1ahZPlGJo");
    expect(
      getImageUUID(
        "https://a.mktgcdn.com/p/ob40t_wP5WDgMN16PKEBrt8gAYyKfev_Hl1ahZPlGJo/"
      )
    ).toBe("ob40t_wP5WDgMN16PKEBrt8gAYyKfev_Hl1ahZPlGJo");
    expect(
      getImageUUID(
        "https://a.mktgcdn.com/p/ob40t_wP5WDgMN16PKEBrt8gAYyKfev_Hl1ahZPlGJo"
      )
    ).toBe("");
    expect(getImageUUID("https://a.mktgcdn.com/p//1300x872.jpg")).toBe("");
    expect(getImageUUID("https://a.mktgcdn.com/p/1300x872.jpg")).toBe("");
    expect(getImageUUID("")).toBe("");

    jest.clearAllMocks();
  });

  it("properly logs error when image url is invalid", () => {
    const logMock = jest.spyOn(console, "error").mockImplementation(() => {});
    const invalidUrl = "https://a.mktgcdn.com/p/1300x872.jpg";

    expect(logMock.mock.calls.length).toBe(0);
    expect(getImageUUID(invalidUrl)).toBe("");
    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(`Invalid image url: ${invalidUrl}.`);

    jest.clearAllMocks();
  });
});

describe("handleLayout", () => {
  it(`properly sets aspectRatio when layout is ${ImageLayout.INTRINSIC} and aspectRatio is provided`, () => {
    const { imgStyle } = handleLayout(
      ImageLayout.INTRINSIC,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      width,
      height,
      aspectRatio
    );

    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });

  it(`properly sets aspectRatio when layout is ${ImageLayout.INTRINSIC} and aspectRatio is not provided`, () => {
    const { imgStyle } = handleLayout(
      ImageLayout.INTRINSIC,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      width,
      height,
      undefined
    );

    expect(imgStyle.aspectRatio).toEqual(`${imgWidth} / ${imgHeight}`);
  });

  it(`properly sets src, imgStyle and widths when layout is ${ImageLayout.FIXED} and only width is provided`, () => {
    const { src, imgStyle, widths } = handleLayout(
      ImageLayout.FIXED,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      width,
      undefined,
      undefined
    );

    expect(src).toEqual(
      `https://dynl.mktgcdn.com/p/${imgUUID}/${width}x${height}`
    );
    expect(imgStyle.width).toEqual(width);
    expect(imgStyle.height).toEqual(height);
    expect(widths).toEqual([width]);
  });

  it(`properly sets aspectRatio when layout is ${ImageLayout.ASPECT} and aspectRatio is provided`, () => {
    const { imgStyle } = handleLayout(
      ImageLayout.ASPECT,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      undefined,
      undefined,
      aspectRatio
    );

    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });

  it(`properly sets width when layout is ${ImageLayout.FILL}`, () => {
    const { imgStyle } = handleLayout(
      ImageLayout.FILL,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      undefined,
      undefined,
      aspectRatio
    );

    expect(imgStyle.width).toEqual("100%");
    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });
});

describe("validateRequiredProps", () => {
  it(`properly logs warning when layout is not ${ImageLayout.FIXED} and width or height is provided`, async () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(logMock.mock.calls.length).toBe(0);
    validateRequiredProps(
      ImageLayout.INTRINSIC,
      imgWidth,
      imgHeight,
      width,
      undefined,
      undefined
    );
    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(
      "Width or height is passed in but layout is not fixed. These will have no impact. If you want to have a fixed height or width then set layout to fixed."
    );
    jest.clearAllMocks();
  });

  it(`properly logs warning when layout is ${ImageLayout.FIXED} and neither width nor height is provided`, async () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayout.FIXED,
      imgWidth,
      imgHeight,
      undefined,
      undefined,
      undefined
    );

    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(
      "Using fixed layout but width and height are not passed as props."
    );
    jest.clearAllMocks();
  });

  it(`properly logs warning when layout is ${ImageLayout.FIXED} and width is a negative value`, async () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});
    const invalidWidth = -100;

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayout.FIXED,
      imgWidth,
      imgHeight,
      invalidWidth,
      undefined,
      undefined
    );

    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(
      `Using fixed layout but width is invalid: ${invalidWidth}.`
    );
    jest.clearAllMocks();
  });

  it(`properly logs warning when layout is ${ImageLayout.ASPECT} and aspectRatio is not provided`, () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayout.ASPECT,
      imgWidth,
      imgHeight,
      undefined,
      undefined,
      undefined
    );

    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(
      "Using aspect layout but aspectRatio is not passed as a prop."
    );
    jest.clearAllMocks();
  });

  it(`properly logs warning when image.width is a negative value`, () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});
    const invalidImgWidth = -100;

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayout.FILL,
      invalidImgWidth,
      imgHeight,
      undefined,
      undefined,
      undefined
    );

    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(
      `Invalid image width: ${invalidImgWidth}.`
    );
    jest.clearAllMocks();
  });
});

describe("getImageSizeForFixedLayout", () => {
  it("properly sets fixedWidth and fixedHeight", () => {
    expect(
      getImageSizeForFixedLayout(
        imgWidth,
        imgHeight,
        widths,
        undefined,
        undefined
      )
    ).toEqual({
      fixedWidth: imgWidth,
      fixedHeight: imgHeight,
      fixedWidths: widths,
    });
    expect(
      getImageSizeForFixedLayout(imgWidth, imgHeight, widths, width, undefined)
    ).toEqual({ fixedWidth: width, fixedHeight: height, fixedWidths: [width] });
    expect(
      getImageSizeForFixedLayout(imgWidth, imgHeight, widths, undefined, height)
    ).toEqual({ fixedWidth: width, fixedHeight: height, fixedWidths: [width] });
    expect(
      getImageSizeForFixedLayout(imgWidth, imgHeight, widths, width, height)
    ).toEqual({ fixedWidth: width, fixedHeight: height, fixedWidths: [width] });
  });
});
