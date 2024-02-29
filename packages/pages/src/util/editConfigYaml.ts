import YAML from "yaml";
import fs from "node:fs";
import { ProjectStructure } from "../common/src/project/structure.js";

export interface ResponseHeaderProps {
  pathPattern: string;
  headerKey: string;
  headerValues: Array<string>;
}

/**
 * Only adds response header if they don't already exist with the same pathPattern
 *
 * @param projectStructure
 * @param responseHeaderProps
 * @param comment to be placed in responseHeader
 */
export const addResponseHeadersToConfigYaml = (
  projectStructure: ProjectStructure,
  responseHeaderProps: ResponseHeaderProps,
  comment: string
) => {
  const configYamlPath = projectStructure.getConfigYamlPath().getAbsolutePath();
  if (!fs.existsSync(configYamlPath)) {
    return;
  }

  const yaml = YAML.parse(fs.readFileSync(configYamlPath, "utf-8"));
  if (
    Object.hasOwn(yaml, "responseHeaders") &&
    yaml.responseHeaders.find(
      (e: ResponseHeaderProps) =>
        e.pathPattern === responseHeaderProps.pathPattern
    )
  ) {
    return;
  } else if (Object.hasOwn(yaml, "responseHeaders")) {
    yaml.responseHeaders.push(responseHeaderProps);
  } else {
    Object.assign(yaml, { responseHeaders: [responseHeaderProps] });
  }

  let yamlDoc = YAML.stringify(yaml);
  if (!yamlDoc.includes(comment)) {
    const index = yamlDoc.indexOf("responseHeaders:");
    if (index !== -1) {
      yamlDoc = yamlDoc.slice(0, index) + comment + yamlDoc.slice(index);
    }
  }
  fs.writeFileSync(configYamlPath, yamlDoc);
};
