class Runtime {
  name: "node" | "deno" | "browser";
  /**
   * Whether or not the current runtime is being executed server-side or client-side. If the runtime
   * is node or deno then isServerSide will be true. When the runtime is browser isServerSide is
   * false.
   */
  isServerSide: boolean;
  version: string;

  constructor() {
    if (this.isDeno()) {
      this.name = "deno";
      this.version = "";
      if (typeof window !== "undefined") {
        this.version = (window as any).Deno?.version.deno || "";
      }
      this.isServerSide = true;
      return;
    }

    if (this.isNode()) {
      this.name = "node";
      this.version = process.versions.node;
      this.isServerSide = true;
      return;
    }

    this.name = "browser";
    this.version = navigator.userAgent;
    this.isServerSide = false;
  }

  isDeno(): boolean {
    return (
      typeof Deno !== "undefined" &&
      typeof Deno.version !== "undefined" &&
      typeof Deno.version.deno !== "undefined"
    );
  }

  isNode() {
    return (
      typeof process !== "undefined" &&
      process.versions != null &&
      process.versions.node != null
    );
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
