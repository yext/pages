import {
  TemplateConfigInternal,
  TemplateModuleInternal,
} from "../internal/types.js";

export const validateTemplateModuleInternal = (
  templateModule: TemplateModuleInternal<any, any>
) => {
  validateConfig(templateModule.filename, templateModule.config);

  if (!templateModule.getPath) {
    throw new Error(
      `Template ${templateModule.filename} is missing an exported getPath function.`
    );
  }

  if (!templateModule.default && !templateModule.render) {
    throw new Error(
      `Template ${templateModule.filename} does not have the necessary exports to produce page. ` +
        "A module should either have a React component as a default export or a render function."
    );
  }
};

export const validateConfig = (
  filename: string,
  templateConfigInternal: TemplateConfigInternal
) => {
  if (!templateConfigInternal.name) {
    throw new Error(
      `Template ${filename} is missing a "name" in the config function.`
    );
  }

  if (templateConfigInternal.streamId && templateConfigInternal.stream) {
    throw new Error(
      `Template ${filename} must not define both a "streamId" and a "stream".`
    );
  }
};
