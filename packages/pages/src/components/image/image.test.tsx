/**
 * @jest-environment jsdom
 */
import * as React from "react";
import {
  Image,
  validateRequiredProps,
  getImageUUID,
  handleLayout,
  getImageSizeForFixedLayout,
  getImageEnv,
} from "./image.js";
import { ImageLayoutOption } from "./types.js";
import { render, screen } from "@testing-library/react";

const imgWidth = 20;
const imgHeight = 10;
const imgUUID = "uuid";
const width = 200;
const height = 100;
const widths = [100, 200, 300];
const aspectRatio = 1;
const simpleImage = {
  alternateText: "alt text",
  width: imgWidth,
  height: imgHeight,
  url: `https://a.mktgcdn.com/p/${imgUUID}/2x1.jpg`,
};
const image = {
  image: simpleImage,
};

describe("Image", () => {
  it("properly renders the image with the pass through style and imgOverrides", () => {
    const overrideSrc = "https://overridesrc/";
    const overrideObjectFit = "none";

    render(
      <Image
        image={image}
        layout={ImageLayoutOption.FIXED}
        width={width}
        height={height}
        style={{ objectFit: overrideObjectFit }}
        imgOverrides={{ src: overrideSrc }}
      />
    );

    expect(screen.getByRole("img").style.objectFit).toEqual(overrideObjectFit);
    expect(screen.getByRole("img")).toHaveProperty("src", overrideSrc);
    expect(screen.getByRole("img")).toHaveProperty(
      "alt",
      image.image.alternateText
    );
  });

  it("properly renders non-complex image field", () => {
    const overrideSrc = "https://overridesrc/";
    const overrideObjectFit = "none";

    render(
      <Image
        image={simpleImage}
        layout={ImageLayoutOption.FIXED}
        width={width}
        height={height}
        style={{ objectFit: overrideObjectFit }}
        imgOverrides={{ src: overrideSrc }}
      />
    );

    expect(screen.getByRole("img").style.objectFit).toEqual(overrideObjectFit);
    expect(screen.getByRole("img")).toHaveProperty("src", overrideSrc);
    expect(screen.getByRole("img")).toHaveProperty(
      "alt",
      simpleImage.alternateText
    );
  });

  it("properly renders the placeholder before the image is loaded", () => {
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

  it("properly renders the placeholder if image's UUID is invalid and a placeholder is provided", () => {
    const placeholderText = "Placeholder";
    const placeholder = <div>{placeholderText}</div>;

    const logMock = jest.spyOn(console, "error").mockImplementation(() => {
      /* do nothing */
    });
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

  it("renders nothing if image's UUID is invalid and a placeholder is not provided", () => {
    const logMock = jest.spyOn(console, "error").mockImplementation(() => {
      /* do nothing */
    });
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

  it("properly renders the srcset based on the correct prod env", () => {
    render(<Image image={image} />);

    const img = screen.getByRole("img", {
      name: /alt text/i,
    });

    expect(img.getAttribute("srcset")).toContain("dynl.mktgcdn.com/p/");
  });

  it("properly renders the srcset based on the correct sandbox env", () => {
    const sbxImage = Object.assign(image.image, {
      url: "https://a.mktgcdn.com/p-sandbox/${imgUUID}/2x1.jpg",
    });

    render(<Image image={sbxImage} />);

    const img = screen.getByRole("img", {
      name: /alt text/i,
    });

    expect(img.getAttribute("srcset")).toContain("dynl.mktgcdn.com/p-sandbox/");
  });

  it("properly renders the sizes for a fixed width", () => {
    render(
      <Image
        image={image}
        layout={ImageLayoutOption.FIXED}
        width={width}
        height={height}
      />
    );

    const img = screen.getByRole("img", {
      name: /alt text/i,
    });

    expect(img.getAttribute("sizes")).toEqual(`${width}px`);
  });

  it("properly renders the sizes for the default widths", () => {
    render(<Image image={image} />);

    const img = screen.getByRole("img", {
      name: /alt text/i,
    });

    expect(img.getAttribute("sizes")).toEqual(
      "(max-width: 640px) 100px, (max-width: 768px) 320px, (max-width: 1024px) 640px, (max-width: 1280px) 960px, (max-width: 1536px) 1280px, 1920px"
    );
  });

  it(`properly renders the image with 'loading' set to 'eager'.`, () => {
    render(<Image image={image} loading="eager" />);

    const img = screen.getByRole("img", {
      name: /alt text/i,
    });

    expect(img.getAttribute("loading")).toEqual("eager");
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
    expect(
      getImageUUID(
        "http://a.mktgcdn.com/p-sandbox/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg"
      )
    ).toBe("EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54");
    expect(
      getImageUUID(
        "http://a.mktgcdn.com/p-qa/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg"
      )
    ).toBe("EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54");
    expect(
      getImageUUID(
        "http://a.mktgcdn.com/p-dev/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg"
      )
    ).toBe("EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54");
    expect(getImageUUID("https://a.mktgcdn.com/p//1300x872.jpg")).toBe("");
    expect(getImageUUID("https://a.mktgcdn.com/p/1300x872.jpg")).toBe("");
    expect(getImageUUID("")).toBe("");

    jest.clearAllMocks();
  });

  describe("getImageEnv", () => {
    it("properly extracts the image env", () => {
      expect(
        getImageEnv(
          "http://a.mktgcdn.com/p/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg"
        )
      ).toBe(undefined);
      expect(
        getImageEnv(
          "https://a.mktgcdn.com/p-sandbox/ob40t_wP5WDgMN16PKEBrt8gAYyKfev_Hl1ahZPlGJo/"
        )
      ).toBe("-sandbox");
      expect(
        getImageEnv(
          "http://a.mktgcdn.com/p-qa/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg"
        )
      ).toBe("-qa");
      expect(
        getImageEnv(
          "http://a.mktgcdn.com/p-dev/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg"
        )
      ).toBe("-dev");

      jest.clearAllMocks();
    });
  });

  it("properly logs error when image url is invalid", () => {
    const logMock = jest.spyOn(console, "error").mockImplementation(() => {
      /* do nothing */
    });
    let invalidUrl = "https://a.mktgcdn.com/p/1300x872.jpg";

    expect(logMock.mock.calls.length).toBe(0);
    expect(getImageUUID(invalidUrl)).toBe("");
    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(`Invalid image url: ${invalidUrl}.`);

    invalidUrl =
      "http://a.mktgcdn.com/p-badinput/EttBe_p52CsFx6ZlAn0-WpvY9h_MCYPH793iInfWY54/443x443.jpg";
    expect(getImageUUID(invalidUrl)).toBe("");
    expect(logMock.mock.calls.length).toBe(2);
    expect(logMock.mock.calls[1][0]).toBe(`Invalid image url: ${invalidUrl}.`);

    jest.clearAllMocks();
  });
});

describe("handleLayout", () => {
  it(`properly sets aspectRatio when layout is ${ImageLayoutOption.INTRINSIC} and aspectRatio is provided`, () => {
    const { imgStyle } = handleLayout(
      ImageLayoutOption.INTRINSIC,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      "",
      width,
      height,
      aspectRatio
    );

    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });

  it(`properly sets aspectRatio when layout is ${ImageLayoutOption.INTRINSIC} and aspectRatio is not provided`, () => {
    const { imgStyle } = handleLayout(
      ImageLayoutOption.INTRINSIC,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      "",
      width,
      height,
      undefined
    );

    expect(imgStyle.aspectRatio).toEqual(`${imgWidth} / ${imgHeight}`);
  });

  it(`properly sets src, imgStyle and widths when layout is ${ImageLayoutOption.FIXED} and only width is provided`, () => {
    const { src, imgStyle, widths } = handleLayout(
      ImageLayoutOption.FIXED,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      "",
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

  it(`properly sets aspectRatio when layout is ${ImageLayoutOption.ASPECT} and aspectRatio is provided`, () => {
    const { imgStyle } = handleLayout(
      ImageLayoutOption.ASPECT,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      "",
      undefined,
      undefined,
      aspectRatio
    );

    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });

  it(`properly sets width when layout is ${ImageLayoutOption.FILL}`, () => {
    const { imgStyle } = handleLayout(
      ImageLayoutOption.FILL,
      imgWidth,
      imgHeight,
      imgUUID,
      {},
      "",
      undefined,
      undefined,
      aspectRatio
    );

    expect(imgStyle.width).toEqual("100%");
    expect(imgStyle.aspectRatio).toEqual(aspectRatio.toString());
  });
});

describe("validateRequiredProps", () => {
  it(`properly logs warning when layout is not ${ImageLayoutOption.FIXED} and width or height is provided`, () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {
      /* do nothing */
    });

    expect(logMock.mock.calls.length).toBe(0);
    validateRequiredProps(
      ImageLayoutOption.INTRINSIC,
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

  it(`properly logs warning when layout is ${ImageLayoutOption.FIXED} and neither width nor height is provided`, () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {
      /* do nothing */
    });

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayoutOption.FIXED,
      imgWidth,
      imgHeight,
      undefined,
      undefined,
      undefined
    );

    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(
      "Using fixed layout but neither width nor height is passed as props."
    );
    jest.clearAllMocks();
  });

  it(`properly logs warning when layout is ${ImageLayoutOption.FIXED} and width is a negative value`, () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {
      /* do nothing */
    });
    const invalidWidth = -100;

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayoutOption.FIXED,
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

  it(`properly logs warning when layout is ${ImageLayoutOption.ASPECT} and aspectRatio is not provided`, () => {
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {
      /* do nothing */
    });

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayoutOption.ASPECT,
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
    const logMock = jest.spyOn(console, "warn").mockImplementation(() => {
      /* do nothing */
    });
    const invalidImgWidth = -100;

    expect(logMock.mock.calls.length).toBe(0);

    validateRequiredProps(
      ImageLayoutOption.FILL,
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
