import {
  Config,
  TemplateModule,
} from "../../../../../common/templateModule/types";

export const validateTemplateModule = (templateModule: TemplateModule<any>) => {
  if (!templateModule.config) {
    throw new Error(
      `Template ${templateModule.filename} is missing an exported config function.`
    );
  }

  validateConfig(templateModule.filename, templateModule.config);

  if (!templateModule.getPath) {
    throw new Error(
      `Template ${templateModule.filename} is missing an exported getPath function.`
    );
  }

  if (!templateModule.render) {
    throw new Error(
      `Template ${templateModule.filename} is missing an exported render function.`
    );
  }
};

const validateConfig = (filename: string, config: Config) => {
  if (!config.name) {
    throw new Error(`Template ${filename} is a "name" in the config function.`);
  }
};
