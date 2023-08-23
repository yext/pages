import path from "path";
import { Path } from "../../common/src/project/path.js";
import { ProjectStructure } from "../../common/src/project/structure.js";
import { Command } from "commander";
import { createArtifactsJson } from "./createArtifactsJson.js";

const handler = async ({ scope }: { scope: string }) => {
  const projectStructure = await ProjectStructure.init({ scope });

  const artifactPath = new Path(
    path.join(
      projectStructure.config.rootFolders.dist,
      projectStructure.config.distConfigFiles.artifacts
    )
  );

  createArtifactsJson(artifactPath.getAbsolutePath(), projectStructure);
};

export const artifactsCommand = (program: Command) => {
  program
    .command("artifacts")
    .description("Generatesartifacts.json file")
    .option(
      "--scope <string>",
      "The subfolder to scope the served templates from"
    )
    .action(handler);
};
