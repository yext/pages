import prompts, { PromptObject } from "prompts";
import { ProjectStructure } from "../../common/src/project/structure.js";

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
      // TODO: Validate template name
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
        values.entityScope === "Entity Type" ? "text" : null,
      name: "entityTypes",
      message: "Enter the entity type(s):",
    },
    {
      type: (prev, values) => (values.entityScope === "Filter" ? "text" : null),
      name: "savedFilterIds",
      message: "Enter the saved filter ID(s):",
    },
    {
      type: (prev, values) =>
        values.entityScope === "Entity Id" ? "text" : null,
      name: "entityIds",
      message: "Enter the entity ID(s):",
    },
  ];

  const response = await prompts(questions);

  // TODO (SUMO-5251): handle generating VE templates
  // TODO (SUMO-5252): handle generating non-VE templates
};
