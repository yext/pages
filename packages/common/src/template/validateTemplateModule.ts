import { TemplateModule } from "./types.js";

export const validateTemplateModule = (templateModule: TemplateModule<any>) => {
  if (!templateModule.config) {
    throw new Error(
      `Template ${templateModule.filename} is missing an exported config function.`
    );
  }

  validateConfig(templateModule);

  if (!templateModule.getPath) {
    throw new Error(
      `Template ${templateModule.filename} is missing an exported getPath function.`
    );
  }

  if (!templateModule.default && !templateModule.render) {
    throw new Error(
      `Module ${templateModule.filename} does not have the necessary exports to produce page. ` +
        "A module should either have a React component as a default export or a render function."
    );
  }
};

const validateConfig = (templateModule: TemplateModule<any>) => {
  if (!templateModule.config.name) {
    throw new Error(
      `Template ${templateModule.filename} is missing a "name" in the config function.`
    );
  }

  if (templateModule.config.streamId && templateModule.config.stream) {
    throw new Error(
      `Template ${templateModule.filename} must not define both a "streamId" and a "stream".`
    );
  }
};
