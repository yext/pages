import { HeadConfig, renderHeadConfigToString } from "../../src/template/head";

describe("renderHeadConfigToString", () => {
    it("properly renders a default title and excludes missing optionals", async () => {
        const headConfig: HeadConfig = {};
    
        const expectedHeadConfig = `<title>Yext Pages Site</title>`;
    
        expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
          expectedHeadConfig.replaceAll(" ", "")
        );
      });

  it("properly renders the title and excludes missing optionals", async () => {
    const headConfig: HeadConfig = {
      title: "foo",
    };

    const expectedHeadConfig = `<title>foo</title>`;

    expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
      expectedHeadConfig.replaceAll(" ", "")
    );
  });

  it("properly renders the title and optionals", async () => {
    const headConfig: HeadConfig = {
      title: "foo",
      charset: "UTF-8",
    };

    const expectedHeadConfig = `<title>foo</title>
        <meta charset="UTF-8">`;

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
          title: "meta",
          attributes: {
            description: "foobar",
          },
        },
        {
          title: "link",
          attributes: {
            href: "/link/to/stylesheet",
            rel: "stylesheet",
          },
        },
        {
          title: "script",
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

  it("properly renders arbitrary content", async () => {
    const headConfig: HeadConfig = {
      title: "foo",
      arbitary: `<script>window.alert("hello world!");</script>
            <template>
                <div>I am a template</div>
            </template>`,
    };

    const expectedHeadConfig = `<title>foo</title>
        <script>window.alert("hello world!");</script>
        <template>
            <div>I am a template</div>
        </template>`;

    expect(renderHeadConfigToString(headConfig).replaceAll(" ", "")).toEqual(
      expectedHeadConfig.replaceAll(" ", "")
    );
  });
});
