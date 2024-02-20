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
 */
export const addResponseHeadersToConfigYaml = (
  projectStructure: ProjectStructure,
  responseHeaderProps: ResponseHeaderProps
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

  const yaml = YAML.parseDocument(fs.readFileSync(configYamlPath, "utf-8"));
  const responseHeader: any = yaml.get("responseHeaders");
  responseHeader.comment =
    " This response header allows access to your modules from other sites";

  fs.writeFileSync(configYamlPath, YAML.stringify(yaml));
};
