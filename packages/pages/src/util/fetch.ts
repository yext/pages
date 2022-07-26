import { getRuntime } from "./runtime";

const fetchInternal = async (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<any> => {
  const runtime = getRuntime();

  // Check if running in Node 17 or less, which does not support native fetch
  if (runtime.name == "node" && runtime.getNodeMajorVersion() < 18) {
    const { default: crossFetch } = await import("cross-fetch");
    return crossFetch(input, init);
  }

  return fetch(input, init);
};

export { fetchInternal as fetch };
