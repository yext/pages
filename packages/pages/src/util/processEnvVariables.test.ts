import { describe, it, expect, beforeAll } from "vitest";
import { processEnvVariables } from "./processEnvVariables.js";

describe("processEnvVariables", () => {
  beforeAll(() => {
    global.process.env = {
      NODE_ENV: "production",
      VITE_KEY: "pk.abcdefghij",
      YEXT_PUBLIC_KEY: "pk.0123456789",
      SECRET: "secret",
    };
  });

  it("filters .env for Vite specific variables for production", () => {
    const env = processEnvVariables();
    expect(Object.keys(env).length).toEqual(1);
    expect(env.VITE_KEY).toEqual(`"pk.abcdefghij"`);
  });

  it("filters .env for Vite specific variables with custom prefix for production", () => {
    const env = processEnvVariables("YEXT_PUBLIC");

    expect(Object.keys(env).length).toEqual(1);
    expect(env.YEXT_PUBLIC_KEY).toEqual(`"pk.0123456789"`);
  });

  it("returns all env vars for development", () => {
    global.process.env.NODE_ENV = "development";
    const env = processEnvVariables("YEXT_PUBLIC");

    expect(Object.keys(env).length).toEqual(4);
    expect(env.VITE_KEY).toEqual(`"pk.abcdefghij"`);
    expect(env.YEXT_PUBLIC_KEY).toEqual(`"pk.0123456789"`);
    expect(env.SECRET).toEqual(`"secret"`);
    expect(env.NODE_ENV).toEqual(`"development"`);
  });

  it("filters out the _ env var", () => {
    global.process.env._ = "foo";
    const env = processEnvVariables("YEXT_PUBLIC");

    expect(Object.keys(env).length).toEqual(4);
    expect(env.VITE_KEY).toEqual(`"pk.abcdefghij"`);
    expect(env.YEXT_PUBLIC_KEY).toEqual(`"pk.0123456789"`);
    expect(env.SECRET).toEqual(`"secret"`);
    expect(env.NODE_ENV).toEqual(`"development"`);
  });

  it("filters out the invalid keys", () => {
    global.process.env = {
      NODE_ENV: "development",
      VITE_KEY: "pk.abcdefghij",
      YEXT_PUBLIC_KEY: "pk.0123456789",
      SECRET: "secret",
      "THIS_IS_(BAD)": "secret",
    };

    const env = processEnvVariables();

    expect(Object.keys(env).length).toEqual(4);
    expect(env).toEqual({
      NODE_ENV: `"development"`,
      VITE_KEY: `"pk.abcdefghij"`,
      YEXT_PUBLIC_KEY: `"pk.0123456789"`,
      SECRET: `"secret"`,
    });
  });
});
