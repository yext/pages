class Runtime {
  name: "node" | "deno" | "browser";
  version: string;

  constructor() {
    if (typeof process !== "undefined") {
      this.name = "node";
      this.version = process.versions.node;
    } else if (typeof window !== "undefined" && !("Deno" in window)) {
      this.name = "browser";
      this.version = navigator.userAgent;
    } else {
      this.name = "deno";
      this.version = "";
      if (typeof window !== "undefined") {
        // @ts-ignore
        this.version = window?.Deno?.version.deno || "";
      }
    }
  }

  getNodeMajorVersion(): number {
    if (this.name != "node") {
      throw new Error("Not running in Node.");
    }

    return +this.version.split(".")[0];
  }
}

/**
 * Returns a class that has information about the runtime executing the
 * code. This is important because the code can be executed in:
 * - Node (during local dev)
 * - Deno (during production build/generation)
 * - the browser (any executed frontend code)
 *
 * This can be useful when the function or library differs depending on
 * the runtime. `fetch` is one example as it's not native to Node &lt; v18.
 *
 * @public
 */
export const getRuntime = (): Runtime => {
  return new Runtime();
};
