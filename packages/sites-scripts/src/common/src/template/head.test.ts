import { HeadConfig, renderHeadConfigToString, TagType, getLang } from "./head";
import { TemplateModule, TemplateRenderProps } from "./types";

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
      projectFilepaths: {
        templatesRoot: "",
        distRoot: "",
        hydrationBundleOutputRoot: "",
        serverBundleOutputRoot: ""
      },
      bundlerManifest: {}
    }
  }
}