import { HeadConfig, renderHeadConfigToString, getLang } from "./head.js";
import { TemplateRenderProps } from "./types.js";
import pc from "picocolors";

describe("renderHeadConfigToString", () => {
  it("properly renders a default title and excludes missing optionals", async () => {
    const headConfig: HeadConfig = {};

    const expectedHeadConfig = `<title>Yext Pages Site</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">`;

    expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
      expectedHeadConfig.replaceAll(" ", "")
    );
  });

  it("properly renders the title and excludes missing optionals", async () => {
    const headConfig: HeadConfig = {
      title: "foo",
    };

    const expectedHeadConfig = `<title>foo</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">`;

    expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
      expectedHeadConfig.replaceAll(" ", "")
    );
  });

  it("properly renders tag whose type is not supported", async () => {
    const headConfig = {
      title: "foo",
      charset: "UTF-8",
      viewport: "bar",
      tags: [
        {
          type: "wrongType",
          attributes: {
            details: "shouldnotrender",
          },
        },
      ],
    };

    const expectedHeadConfig = `<title>foo</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="bar">`;

    expect(
      renderHeadConfigToString(headConfig as HeadConfig).replaceAll(" ", "")
    ).toEqual(expectedHeadConfig.replaceAll(" ", ""));
  });

  it("properly renders the title and optionals", async () => {
    const headConfig: HeadConfig = {
      title: "foo",
      charset: "foo",
    };

    const expectedHeadConfig = `<title>foo</title>
      <meta charset="foo">
      <meta name="viewport" content="width=device-width,initial-scale=1">`;

    expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
      expectedHeadConfig.replaceAll(" ", "")
    );
  });

  it("properly renders tags", async () => {
    const headConfig: HeadConfig = {
      title: "foo",
      charset: "UTF-8",
      viewport: "bar",
      tags: [
        {
          type: "meta",
          attributes: {
            description: "foobar",
          },
        },
        {
          type: "link",
          attributes: {
            href: "/link/to/stylesheet",
            rel: "stylesheet",
          },
        },
        {
          type: "script",
          attributes: {
            src: "./path/to/script",
          },
        },
      ],
    };

    const expectedHeadConfig = `<title>foo</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="bar">
        <meta description="foobar">
        <link href="/link/to/stylesheet" rel="stylesheet">
        <script src="./path/to/script"></script>`;

    expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
      expectedHeadConfig.replaceAll(" ", "")
    );
  });

  it("properly renders other content", async () => {
    const headConfig: HeadConfig = {
      title: "foo",
      other: `<script>window.alert("hello world!");</script>
            <template>
                <div>I am a template</div>
            </template>`,
    };

    const expectedHeadConfig = `<title>foo</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <script>window.alert("hello world!");</script>
        <template>
            <div>I am a template</div>
        </template>`;

    expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
      expectedHeadConfig.replaceAll(" ", "")
    );
  });

  it("properly logs warning when rendering tag whose type is not supported", async () => {
    const headConfig = {
      title: "foo",
      charset: "UTF-8",
      viewport: "bar",
      tags: [
        {
          type: "wrongtype",
          attributes: {
            details: "shouldnotrender",
          },
        },
      ],
    };

    const expectedLog = pc.yellow(
      `[WARNING]: Tag type wrongtype is unsupported by the Tag interface. ` +
        `Please use "other" to render this tag.`
    );

    jest.clearAllMocks();
    const logMock = jest
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    expect(logMock.mock.calls.length).toBe(0);
    renderHeadConfigToString(headConfig as HeadConfig);
    expect(logMock.mock.calls.length).toBe(1);
    expect(logMock.mock.calls[0][0]).toBe(expectedLog);

    jest.clearAllMocks();
  });
});

describe("getLang", () => {
  it("returns the correct lang when headConfig overrides it", async () => {
    const lang = "fr";
    const headConfig: HeadConfig = { lang: lang };

    expect(getLang(headConfig, templateProps)).toEqual(lang);
  });

  it("returns the correct lang when headConfig does not override it", async () => {
    const lang = "fr";
    const props: TemplateRenderProps = {
      document: { locale: lang },
      path: "",
      relativePrefixToRoot: "",
      __meta: { mode: "development" },
    };

    expect(getLang(undefined, props)).toEqual(lang);
  });

  it("returns the correct lang when both headConfig and props do not contain a lang/locale", async () => {
    expect(getLang(undefined, templateProps)).toEqual("en");
  });
});

const templateProps: TemplateRenderProps = {
  path: "",
  relativePrefixToRoot: "",
  document: {},
  __meta: {
    mode: "development",
    manifest: {
      bundlePaths: {},
      renderPaths: {},
      projectFilepaths: {
        templatesRoot: "",
        distRoot: "",
        serverBundleOutputRoot: "",
      },
      bundlerManifest: {},
    },
  },
};
