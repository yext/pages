class Runtime {
  name: "node" | "deno" | "browser";
  version: string;

  constructor() {
    if (typeof process !== "undefined") {
      this.name = "node";
      this.version = process.versions.node;
    } else if ("Deno" in window) {
      this.name = "deno";
      // @ts-ignore
      this.version = window.Deno.version.deno;
    } else {
      this.name = "browser";
      this.version = navigator.userAgent;
    }
  }

  getNodeMajorVersion(): number {
    if (this.name != "node") {
      throw new Error("Not running in Node.");
    }

    return +this.version.split(".")[0];
  }
}

export const getRuntime = (): Runtime => {
  return new Runtime();
};
