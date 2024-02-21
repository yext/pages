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
  comment: string | undefined
) => {
  const configYamlPath = projectStructure.getConfigYamlPath().getAbsolutePath();
  if (!fs.existsSync(configYamlPath)) {
    return;
  }

  const yamlDoc = YAML.parse(fs.readFileSync(configYamlPath, "utf-8"));
  if (
    Object.hasOwn(yamlDoc, "responseHeaders") &&
    yamlDoc.responseHeaders.find(
      (e: ResponseHeaderProps) =>
        e.pathPattern === responseHeaderProps.pathPattern
    )
  ) {
    return;
  } else if (Object.hasOwn(yamlDoc, "responseHeaders")) {
    yamlDoc.responseHeaders.push(responseHeaderProps);
  } else {
    Object.assign(yamlDoc, { responseHeaders: [responseHeaderProps] });
  }

  fs.writeFileSync(configYamlPath, YAML.stringify(yamlDoc));

  if (comment) {
    const yaml = YAML.parseDocument(fs.readFileSync(configYamlPath, "utf-8"));
    const responseHeader: any = yaml.get("responseHeaders");
    responseHeader.comment = comment;

    fs.writeFileSync(configYamlPath, YAML.stringify(yaml));
  }
};
