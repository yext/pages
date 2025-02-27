import prompts, { PromptObject } from "prompts";
import { ProjectStructure } from "../../common/src/project/structure.js";
import path from "node:path";
import fs from "node:fs";
import {
  buildSchemaUtil,
  defaultLayoutData,
  dynamicTemplate,
  newConfigFile,
  staticTemplate,
  tailwindConfig,
  veThemeConfig,
  visualEditorTemplateCode,
} from "./sampleTemplates.js";
import { addDataToPuckConfig } from "../../common/src/parsers/puckConfigParser.js";
import {
  installDependencies,
  updatePackageDependency,
} from "../../upgrade/pagesUpdater.js";
import { logErrorAndExit } from "../../util/logError.js";
import { addThemeConfigToTailwind } from "../../common/src/parsers/tailwindConfigParser.js";
import { TemplateManifest } from "../../common/src/template/types.js";

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
    // TODO: Add this back when hybrid VE templates are supported
    // {
    //   type: "confirm",
    //   name: "isVisualEditor",
    //   message: "Is this a Visual Editor template?",
    //   initial: true,
    // },
    {
      // type: (prev) => (prev ? null : "toggle"),
      type: "toggle",
      name: "isDynamic",
      message: "Is this a static or dynamic template?",
      initial: true,
      active: "Dynamic",
      inactive: "Static",
    },
  ];

  const entityScopeQuestions: PromptObject[] = [
    {
      type: "select",
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
      message: "Enter the entity type(s) as a comma-separated list:",
      initial: "",
      separator: ",",
    },
    {
      type: (prev, values) =>
        values.entityScope === "savedFilterIds" ? "list" : null,
      name: "filter",
      message: "Enter the saved filter ID(s) as a comma-separated list:",
      initial: "",
      separator: ",",
    },
    {
      type: (prev, values) =>
        values.entityScope === "entityIds" ? "list" : null,
      name: "filter",
      message: "Enter the entity ID(s) as a comma-separated list:",
      initial: "",
      separator: ",",
    },
  ];

  const response = await prompts(questions);

  if (response.isVisualEditor) {
    await generateVETemplate(response, projectStructure);
  } else {
    if (response.isDynamic) {
      const subsequentResponse = await prompts(entityScopeQuestions);
      await generateDynamicTemplate(
        { ...response, ...subsequentResponse },
        projectStructure
      );
    } else {
      await generateStaticTemplate(response.templateName, projectStructure);
    }
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
// and adds the new VE template and config to src/ve.config.tsx
const generateVETemplate = async (
  response: any,
  projectStructure: ProjectStructure
) => {
  const templatePath = projectStructure.getTemplatePaths()[0].path;
  const templateFilename = formatFileName(response.templateName);

  fs.writeFileSync(
    path.join(templatePath, `${templateFilename}.tsx`),
    visualEditorTemplateCode(templateFilename)
  );
  addVETemplateToConfig(templateFilename, projectStructure);
  addVEThemeConfig();
  addTailwindConfig();
  addBuildSchemaUtil(projectStructure);
  addTemplateManifest(templateFilename, projectStructure);

  try {
    await addVEDependencies();
  } catch (error) {
    logErrorAndExit(error);
  }
};

const addVETemplateToConfig = (
  fileName: string,
  projectStructure: ProjectStructure
) => {
  const configPath = path.join(
    projectStructure.config.rootFolders.source,
    "ve.config.tsx"
  );
  if (fs.existsSync(configPath)) {
    addDataToPuckConfig(fileName, configPath);
  } else {
    fs.writeFileSync(configPath, newConfigFile(fileName));
  }
};

const addVEThemeConfig = () => {
  const themeConfigPath = path.join("ve.config.tsx");
  if (fs.existsSync(themeConfigPath)) {
    return;
  }

  fs.writeFileSync(themeConfigPath, veThemeConfig);
};

const addTailwindConfig = () => {
  const tailwindConfigPath = path.join("tailwind.config.ts");
  if (fs.existsSync(tailwindConfigPath)) {
    addThemeConfigToTailwind(tailwindConfigPath);
    return;
  }

  fs.writeFileSync(tailwindConfigPath, tailwindConfig);
};

const addBuildSchemaUtil = (projectStructure: ProjectStructure) => {
  const buildSchemaUtilPath = path.join(
    projectStructure.config.rootFolders.source,
    "utils",
    "buildSchema.ts"
  );
  if (fs.existsSync(buildSchemaUtilPath)) {
    return;
  }

  fs.writeFileSync(buildSchemaUtilPath, buildSchemaUtil);
};

const addTemplateManifest = (
  templateName: string,
  projectStructure: ProjectStructure
) => {
  const templateManifestPath = projectStructure
    .getTemplateManifestPath()
    .getAbsolutePath();

  let templateManifest: TemplateManifest;
  if (fs.existsSync(templateManifestPath)) {
    templateManifest = JSON.parse(
      fs.readFileSync(templateManifestPath, "utf-8")
    ) as TemplateManifest;
  } else {
    templateManifest = { templates: [] };
  }

  templateManifest.templates.push({
    name: templateName,
    description: `Use this template to generate pages for each of your ${templateName}.`,
    exampleSiteUrl: "",
    layoutRequired: true,
    defaultLayoutData: defaultLayoutData,
  });

  fs.writeFileSync(
    templateManifestPath,
    JSON.stringify(templateManifest, null, 2)
  );
};

const addVEDependencies = async () => {
  await updatePackageDependency("@yext/visual-editor", null, true);
  await updatePackageDependency(
    "@measured/puck",
    "0.16.0-canary.39e7f40",
    true
  );
  await installDependencies();
};

// Creates a file with a basic dynamic template based on provided user responses
const generateDynamicTemplate = async (
  response: any,
  projectStructure: ProjectStructure
) => {
  const templatePath = projectStructure.getTemplatePaths()[0].path;
  const templateFileName = formatFileName(response.templateName);

  fs.writeFileSync(
    path.join(templatePath, `${templateFileName}.tsx`),
    dynamicTemplate(templateFileName, response.entityScope, response.filter)
  );
};

// Creates a file with a basic static template based templateName provided by user
const generateStaticTemplate = async (
  templateName: string,
  projectStructure: ProjectStructure
) => {
  const templatePath = projectStructure.getTemplatePaths()[0].path;
  const templateFileName = formatFileName(templateName);

  fs.writeFileSync(
    path.join(templatePath, `${templateFileName}.tsx`),
    staticTemplate(templateFileName)
  );
};
