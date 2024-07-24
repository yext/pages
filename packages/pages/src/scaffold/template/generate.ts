import prompts, { PromptObject } from "prompts";
import { ProjectStructure } from "../../common/src/project/structure.js";
import path from "node:path";
import fs from "node:fs";
import { newConfigFile, visualEditorTemplateCode } from "./sampleTemplates.js";
import ConfigParser from "../../common/src/parsers/puckConfigParser.js";

export const generateTemplate = async (
  projectStructure: ProjectStructure
): Promise<void> => {
  const questions: PromptObject[] = [
    {
      type: "text",
      name: "templateName",
      message: "What would you like to name your Template?",
      validate: (templateName) =>
        validateTemplateName(templateName, projectStructure) ||
        "Please ensure the name provided isn't already used and is valid.",
    },
    {
      type: "confirm",
      name: "isVisualEditor",
      message: "Is this a Visual Editor template?",
      initial: true,
    },
    {
      type: (prev) => (prev ? null : "toggle"),
      name: "isDynamic",
      message: "Is this a static or dynamic template?",
      initial: true,
      active: "Dynamic",
      inactive: "Static",
    },
    {
      type: (prev) => (prev ? "select" : null),
      name: "entityScope",
      message:
        "How would you like you to define the entity scope for your template?",
      choices: [
        { title: "Entity Type", value: "entityTypes" },
        { title: "Saved Filter", value: "savedFilterIds" },
        { title: "Entity Id", value: "entityIds" },
      ],
    },
    {
      type: (prev, values) =>
        values.entityScope === "entityTypes" ? "list" : null,
      name: "filter",
      message: "Enter the entity type(s):",
      initial: "",
      separator: ",",
    },
    {
      type: (prev, values) =>
        values.entityScope === "savedFilterIds" ? "list" : null,
      name: "filter",
      message: "Enter the saved filter ID(s):",
      initial: "",
      separator: ",",
    },
    {
      type: (prev, values) =>
        values.entityScope === "entityIds" ? "list" : null,
      name: "filter",
      message: "Enter the entity ID(s):",
      initial: "",
      separator: ",",
    },
  ];

  const response = await prompts(questions);

  if (response.isVisualEditor) {
    generateVETemplate(response, projectStructure);
  } else {
    // TODO (SUMO-5252): handle generating non-VE templates
  }
};

// Returns true if templateName can be formatted into valid filename and that filename isn't being used.
const validateTemplateName = (
  templateName: string,
  projectStructure: ProjectStructure
): boolean => {
  const formattedFileName = formatFileName(templateName);

  // Must start with an alphabetic char
  if (/^[^a-zA-Z]/.test(formattedFileName)) {
    return false;
  }

  const templatePath = path.join(
    projectStructure.getTemplatePaths()[0].path,
    formattedFileName
  );
  if (fs.existsSync(templatePath)) {
    return false;
  }

  return true;
};

const formatFileName = (templateName: string): string => {
  const specialCharsRemoved = templateName.replace(/[^a-zA-Z0-9\s]+/g, "");

  const words = specialCharsRemoved.split(" ");
  if (words.length === 0) {
    return "";
  }

  let fileName = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    fileName +=
      words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }

  return fileName;
};

// Creates a src/templates/ file with a basic template based on provided user responses
// and adds the new VE template and config to src/ve.config.ts
const generateVETemplate = (
  response: any,
  projectStructure: ProjectStructure
) => {
  const templatePath = projectStructure.getTemplatePaths()[0].path;
  const templateFileName = formatFileName(response.templateName);

  fs.writeFileSync(
    path.join(templatePath, `${templateFileName}.tsx`),
    visualEditorTemplateCode(
      response.templateName,
      templateFileName,
      response.entityScope,
      response.filter
    )
  );
  addVETemplateToConfig(
    response.templateName,
    templateFileName,
    projectStructure
  );
};

const addVETemplateToConfig = (
  templateName: string,
  fileName: string,
  projectStructure: ProjectStructure
) => {
  const configPath = path.join(
    projectStructure.config.rootFolders.source,
    "ve.config.ts"
  );
  if (fs.existsSync(configPath)) {
    new ConfigParser().addDataToPuckConfig(
      templateName,
      fileName.charAt(0).toUpperCase() + fileName.slice(1),
      fileName,
      configPath
    );
  } else {
    fs.writeFileSync(configPath, newConfigFile(templateName, fileName));
  }
};
