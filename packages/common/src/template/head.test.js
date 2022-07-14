import { renderHeadConfigToString } from "./head";

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
});