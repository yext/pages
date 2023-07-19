import { getYextUrlForPartition } from "./url.js";

describe("getYextUrlForPartition", () => {
  it("get Yext url for a US prod account", () => {
    const url = getYextUrlForPartition("prod", "US");
    const url2 = getYextUrlForPartition("production", "US");
    expect(url).toEqual("yext.com");
    expect(url2).toEqual("yext.com");
  });

  it("get Yext url for a US sandbox account", () => {
    const url = getYextUrlForPartition("sandbox", "US");
    const url2 = getYextUrlForPartition("sbx", "US");
    expect(url).toEqual("sandbox.yext.com");
    expect(url2).toEqual("sandbox.yext.com");
  });

  it("get Yext url for a US qa account", () => {
    const url = getYextUrlForPartition("qa", "US");
    expect(url).toEqual("qa.yext.com");
  });

  it("get Yext url for a US dev account", () => {
    const url = getYextUrlForPartition("dev", "US");
    expect(url).toEqual("dev.yext.com");
  });

  it("get Yext url for an EU prod account", () => {
    const url = getYextUrlForPartition("prod", "EU");
    const url2 = getYextUrlForPartition("production", "EU");
    expect(url).toEqual("app.eu.yext.com");
    expect(url2).toEqual("app.eu.yext.com");
  });

  it("get Yext url for an EU qa account", () => {
    const url = getYextUrlForPartition("qa", "EU");
    expect(url).toEqual("app-qa.eu.yext.com");
  });

  it("get Yext url for an invalid partition", () => {
    const url = getYextUrlForPartition("prod", "AS");
    expect(url).toEqual("");
  });

  it("get Yext url for an invalid universe", () => {
    const url = getYextUrlForPartition("newuniverse", "US");
    const url2 = getYextUrlForPartition("newuniverse", "EU");
    expect(url).toEqual("");
    expect(url2).toEqual("");
  });
});
