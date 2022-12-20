import { processEnvVariables } from "./processEnvVariables.js";

describe("processEnvVariables", () => {
  beforeAll(() => {
    global.process.env = {
      NODE_ENV: "development",
      VITE_KEY: "pk.abcdefghij",
      YEXT_PUBLIC_KEY: "pk.0123456789",
    };
  });

  it("filters .env for Vite specific variables", () => {
    const env = processEnvVariables();

    expect(Object.keys(env).length).toEqual(1);
    expect(env.VITE_KEY).toEqual(`"pk.abcdefghij"`);
  });

  it("filters .env for Vite specific variables with custom prefix", () => {
    const env = processEnvVariables("YEXT_PUBLIC");

    expect(Object.keys(env).length).toEqual(1);
    expect(env.YEXT_PUBLIC_KEY).toEqual(`"pk.0123456789"`);
  });
});
