import { version } from "react";

// Functions extracted for testing purposes.

export const getReactVersion = () => {
  return parseInt(version);
};

export { globSync } from "glob";
export { existsSync } from "node:fs";
