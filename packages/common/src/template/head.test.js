import { renderHeadConfigToString } from "./head";
import pc from "picocolors";

let consoleLog;
beforeAll(() => {
    consoleLog = jest.spyOn(console, 'log').mockImplementation();
});

afterAll(() => {
    consoleLog.mockRestore();
});

describe("renderHeadConfigToString", () => {
  it("properly renders tag whose type is not supported", async () => {
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

    const expectedHeadConfig = `<title>foo</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="bar">`;

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
    jest.spyOn(console, 'log');

    expect(console.log.mock.calls.length).toBe(0);
    renderHeadConfigToString(headConfig);
    expect(console.log.mock.calls.length).toBe(1);
    expect(console.log.mock.calls[0][0]).toBe(expectedLog);
    
    jest.clearAllMocks();
  });
});