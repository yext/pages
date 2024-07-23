import prompts, { PromptObject } from "prompts";
import { ProjectStructure } from "../../common/src/project/structure.js";
import path from "node:path";
import fs from "node:fs";

/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Remove after using adding generation code for templates

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
        { title: "Entity Type", value: "Entity Type" },
        { title: "Static", value: "Static" },
        { title: "Filter", value: "Filter" },
        { title: "Entity Id", value: "Entity Id" },
      ],
    },
    {
      type: (prev, values) =>
        values.entityScope === "Entity Type" ? "list" : null,
      name: "entityTypes",
      message: "Enter the entity type(s):",
      initial: "",
      separator: ",",
    },
    {
      type: (prev, values) => (values.entityScope === "Filter" ? "list" : null),
      name: "savedFilterIds",
      message: "Enter the saved filter ID(s):",
      initial: "",
      separator: ",",
    },
    {
      type: (prev, values) =>
        values.entityScope === "Entity Id" ? "list" : null,
      name: "entityIds",
      message: "Enter the entity ID(s):",
      initial: "",
      separator: ",",
    },
  ];

  const response = await prompts(questions);

  // TODO (SUMO-5251): handle generating VE templates
  // TODO (SUMO-5252): handle generating non-VE templates
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
