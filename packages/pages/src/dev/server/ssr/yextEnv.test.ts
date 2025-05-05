import { describe, it, expect, afterEach, vi } from "vitest";
import fs from "fs";
import { getEnvFromYextCredential } from "./yextEnv.js";

// Mock the fs module
vi.mock("fs");

describe("getEnvFromYextCredential", () => {
  afterEach(() => {
    vi.restoreAllMocks(); // Reset all mocks between tests
  });

  const mockFile = (content: string) => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(content);
  };

  it('should return "development" if the env is set to development', () => {
    mockFile(JSON.stringify({ env: "development" }));
    expect(getEnvFromYextCredential()).toBe("development");
  });

  it('should return "qa" if the env is set to qa', () => {
    mockFile(JSON.stringify({ env: "qa" }));
    expect(getEnvFromYextCredential()).toBe("qa");
  });

  it('should return "sandbox" if the env is set to sandbox', () => {
    mockFile(JSON.stringify({ env: "sandbox" }));
    expect(getEnvFromYextCredential()).toBe("sandbox");
  });

  it('should return "production" if the env is set to production', () => {
    mockFile(JSON.stringify({ env: "production" }));
    expect(getEnvFromYextCredential()).toBe("production");
  });

  it('should return "production" if file does not exist', () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    expect(getEnvFromYextCredential()).toBe("production");
  });

  it('should return "production" if file content is invalid JSON', () => {
    mockFile("this is not json");
    expect(getEnvFromYextCredential()).toBe("production");
  });

  it('should return "production" if "env" field is missing', () => {
    mockFile(JSON.stringify({}));
    expect(getEnvFromYextCredential()).toBe("production");
  });

  it('should return "production" if "env" is an invalid string', () => {
    mockFile(JSON.stringify({ env: "staging" }));
    expect(getEnvFromYextCredential()).toBe("production");
  });

  it('should return "production" if an unexpected error occurs', () => {
    vi.spyOn(fs, "existsSync").mockImplementation(() => {
      throw new Error("Unexpected failure");
    });
    expect(getEnvFromYextCredential()).toBe("production");
  });
});
