import React from "react";
import {Image, getImageUUID, handleLayout} from "./image";
import {ImageLayout} from "./types";
import { render, screen } from '@testing-library/react';

const imgWidth = 20;
const imgHeight = 10;
const imgUUID = "uuid";
const width = 200;
const height = 100;
const aspectRatio = 1;
const image = {
  image: {
    width: imgWidth,
    height: imgHeight,
    url: `https://a.mktgcdn.com/p/${imgUUID}/2x1.jpg`,
  },
};

/**
 * @jest-environment node
 */

describe("Image", () => {
  it(`properly logs warning when layout is not ${ImageLayout.FIXED} and width or height is provided`, async () => {
    jest.clearAllMocks();
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(logMock.mock.calls.length).toBe(0);
    render(<Image
      image={image}
      layout={ImageLayout.INTRINSIC}
      width={100}
    />);
    expect(logMock.mock.calls.length).toBe(1);

    jest.clearAllMocks();
  });

  it("properly renders the image with the pass through style and imgOverrides", () => {

    const overrideSrc = "https://overridesrc/";
    const overrideObjectFit = "none";

    render(<Image
      image={image}
      layout={ImageLayout.FIXED}
      width={width}
      style={{objectFit: overrideObjectFit}}
      imgOverrides={{src: overrideSrc}}
    />);

    expect(screen.getByRole("img").style.objectFit).toEqual(overrideObjectFit);
    expect(screen.getByRole("img")).toHaveProperty("src", overrideSrc);
  });

  it("properly renders the placeholder before the image is loaded", async () => {
    const placeholderText = "Placeholder";
    const placeholder = <div>{placeholderText}</div>;
    const onLoad = jest.fn();

    render(<Image
      image={image}
      placeholder={placeholder}
      imgOverrides={{onLoad: () => onLoad()}}
    />);

    expect(screen.getByText(placeholderText)).toBeTruthy();
  });
});

describe("getImageUUID", () => {
  it("properly extracts the image UUID when image url is valid", () => {
    expect(getImageUUID("https://a.mktgcdn.com/p/MbV9F8oMM7960s8ZuZ97P0mI5a7iwkIjG5OSfQDzWgg/4032x3024.jpg"))
        .toBe("MbV9F8oMM7960s8ZuZ97P0mI5a7iwkIjG5OSfQDzWgg");
  });

  it("properly logs warning when image url is invalid", () => {
    const invalidUrl = "random/url";
    const expectedLog = `Invalid image url: ${invalidUrl}.`;
    jest.clearAllMocks();
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(logMock.mock.calls.length).toBe(0);
    expect(getImageUUID(invalidUrl)).toBe("");
    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(expectedLog);

    jest.clearAllMocks();
  });
});

describe("handleLayout", () => {
  it(`properly sets aspectRatio when layout is ${ImageLayout.INTRINSIC} and aspectRatio is provided`, () => {
    const {imgStyle} = handleLayout(
        ImageLayout.INTRINSIC,
        imgWidth,
        imgHeight,
        imgUUID,
        {},
        width,
        height,
        aspectRatio,
    );

    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });

  it(`properly sets aspectRatio when layout is ${ImageLayout.INTRINSIC} and aspectRatio is not provided`, () => {
    const {imgStyle} = handleLayout(
        ImageLayout.INTRINSIC,
        imgWidth,
        imgHeight,
        imgUUID,
        {},
        width,
        height,
        undefined,
    );

    expect(imgStyle.aspectRatio).toEqual(`${imgWidth} / ${imgHeight}`);
  });

  it(`properly logs warning when layout is ${ImageLayout.FIXED} and neither width nor height is provided`, () => {
    jest.clearAllMocks();
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(logMock.mock.calls.length).toBe(0);

    const {src, imgStyle} = handleLayout(
      ImageLayout.FIXED,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      undefined,
      undefined,
      undefined,
    )

    expect(src).toEqual(`https://dynl.mktgcdn.com/p/${imgUUID}/${imgWidth}x${imgHeight}`);
    expect(imgStyle.width).toEqual(imgWidth);
    expect(imgStyle.height).toEqual(imgHeight);

    expect(logMock.mock.calls.length).toBe(1);
    jest.clearAllMocks();
  });

  it(`properly sets src, imgStyle and widths when layout is ${ImageLayout.FIXED} and only width is provided`, () => {
    const {src, imgStyle, widths} = handleLayout(
        ImageLayout.FIXED,
        imgWidth,
        imgHeight,
        imgUUID,
        {},
        width,
        undefined,
        undefined,
    );

    expect(src).toEqual(`https://dynl.mktgcdn.com/p/${imgUUID}/${width}x${height}`);
    expect(imgStyle.width).toEqual(width);
    expect(imgStyle.height).toEqual(height);
    expect(widths).toEqual([width]);
  });

  it(`properly logs warning when layout is ${ImageLayout.ASPECT} and aspectRatio is not provided`, () => {
    jest.clearAllMocks();
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(logMock.mock.calls.length).toBe(0);

    const {imgStyle} = handleLayout(
        ImageLayout.ASPECT,
        imgWidth,
        imgHeight,
        imgUUID,
        {},
        undefined,
        undefined,
        undefined,
    )

    expect(imgStyle.aspectRatio).toEqual(`${imgWidth} / ${imgHeight}`);
    expect(logMock.mock.calls.length).toBe(1);
    jest.clearAllMocks();
  });

  it(`properly sets aspectRatio when layout is ${ImageLayout.ASPECT} and aspectRatio is provided`, () => {
    const {imgStyle} = handleLayout(
        ImageLayout.ASPECT,
        imgWidth,
        imgHeight,
        imgUUID,
        {},
        undefined,
        undefined,
        aspectRatio,
    );

    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });

  it(`properly sets width when layout is ${ImageLayout.FILL}`, () => {
    const {imgStyle} = handleLayout(
        ImageLayout.FILL,
        imgWidth,
        imgHeight,
        imgUUID,
        {},
        undefined,
        undefined,
        aspectRatio,
    );

    expect(imgStyle.width).toEqual("100%");
    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });
});
