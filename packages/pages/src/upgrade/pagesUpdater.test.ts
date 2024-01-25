import { describe, it, expect } from "vitest";
import {
  moveTsxMapsImportsToPagesComponents,
  removeFetchImport,
  updateServerlessFunctionTypeReferences,
} from "./pagesUpdater.js";
import path from "path";
import fs from "fs";

function testUpdater(
  beforeContent: string,
  expected: string,
  updateFunction: (input: string) => void
): boolean {
  const testFolder = path.resolve("src/upgrade/test");
  const source = path.resolve(testFolder, "src");
  const templates = path.resolve(source, "templates");
  fs.mkdirSync(templates, {
    recursive: true,
  });
  const filePath = path.resolve(templates, "foo.tsx");
  fs.writeFileSync(filePath, beforeContent);
  updateFunction(source);
  const afterContent = fs.readFileSync(filePath, "utf-8");
  fs.rmSync(testFolder, { recursive: true });
  return afterContent === expected;
}

describe("test pages updater fetch import", () => {
  it("removes fetch import", () => {
    const beforeContent = 'import { fetch } from "@yext/pages/util";';
    expect(testUpdater(beforeContent, "", removeFetchImport)).toBeTruthy();
  });

  it("removes fetch import multi-line", () => {
    const beforeContent =
      "import {\n" +
      "  fetch,\n" +
      "  tacos,\n" +
      "  burritos,\n" +
      "  quesadillas,\n" +
      "  chimichangas,\n" +
      '} from "@yext/pages/util";';
    const expected =
      "import {\n" +
      "  tacos,\n" +
      "  burritos,\n" +
      "  quesadillas,\n" +
      "  chimichangas,\n" +
      '} from "@yext/pages/util";';
    expect(
      testUpdater(beforeContent, expected, removeFetchImport)
    ).toBeTruthy();
  });

  it("does not remove fetch import from other sources", () => {
    const beforeContent = 'import { fetch } from "@yext/papers/utilities";';
    expect(
      testUpdater(beforeContent, beforeContent, removeFetchImport)
    ).toBeTruthy();
  });
});

describe("test pages updater serverless function types", () => {
  it("updates imports, param types, and function types", () => {
    const beforeContent = `
      import { SitesHttpRequest, SitesHttpResponse } from "@yext/pages/*";
      import { Foo } from "../../components/ImportTest";

      export default async function test(
        request: SitesHttpRequest
      ): Promise<SitesHttpResponse> {
        const { pathParams, queryParams, site, body, method, headers } = request;

        console.log(Foo);

        // const output = generate("Write a database schema for a hotel")
        const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
        let json;
        if (res.ok) {
          json = await res.json();
        }

        return {
          body: JSON.stringify(json) + SECRET,
          headers: {},
          statusCode: 200,
        };
      }
    `;

    const expected = `
      import { PagesHttpRequest, PagesHttpResponse } from "@yext/pages/*";
      import { Foo } from "../../components/ImportTest";

      export default async function test(
        request: PagesHttpRequest
      ): Promise<PagesHttpResponse> {
        const { pathParams, queryParams, site, body, method, headers } = request;

        console.log(Foo);

        // const output = generate("Write a database schema for a hotel")
        const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
        let json;
        if (res.ok) {
          json = await res.json();
        }

        return {
          body: JSON.stringify(json) + SECRET,
          headers: {},
          statusCode: 200,
        };
      }
    `;

    expect(
      testUpdater(
        beforeContent,
        expected,
        updateServerlessFunctionTypeReferences
      )
    ).toBeTruthy();
  });
});

describe("test pages updater moveTsxMapsImportsToPagesComponents", () => {
  it("moves GoogleMaps/Coordinate to existing pages-components import", () => {
    const beforeContent = `
      import { Maps } from "@yext/pages-components";
      import { GoogleMaps } from "@yext/components-tsx-maps";
      import { Coordinate } from "@yext/components-tsx-geo";
    `;

    const expected = `
      import { Maps, GoogleMaps, Coordinate } from "@yext/pages-components";
    `;

    expect(
      testUpdater(beforeContent, expected, moveTsxMapsImportsToPagesComponents)
    ).toBeTruthy();
  });

  it("adds GoogleMaps to new pages-components import", () => {
    const beforeContent = `
      import { GoogleMaps } from "@yext/components-tsx-maps";
    `;

    const expected = `
      import { GoogleMaps } from "@yext/pages-components";
    `;

    expect(
      testUpdater(beforeContent, expected, moveTsxMapsImportsToPagesComponents)
    ).toBeTruthy();
  });
});
