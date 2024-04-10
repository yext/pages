import { RedirectModuleInternal } from "./types.js";
import { TemplateConfigInternal } from "../../template/internal/types.js";

export const validateRedirectModuleInternal = (
  redirectModule: RedirectModuleInternal<any>
) => {
  validateConfig(redirectModule.filename, redirectModule.config);

  if (!redirectModule.getDestination) {
    throw new Error(
      `Redirect ${redirectModule.filename} is missing an exported getDestination function.`
    );
  }

  if (!redirectModule.getSources) {
    throw new Error(
      `Redirect ${redirectModule.filename} is missing an exported getSources function.`
    );
  }

  // TODO - make this check work
  // const sources = redirectModule.getSources({});
  // for (let i = 0; i < sources.length; i++) {
  //   if (sources[i].statusCode < 300 || sources[i].statusCode >= 400) {
  //     throw new Error(
  //         `Redirect ${redirectModule.filename} has an invalid status code ${sources[i].statusCode}.` +
  //         `Status code must be in the 3xx range.`
  //     );
  //   }
  // }
};

export const validateConfig = (
  filename: string,
  redirectConfigInternal: TemplateConfigInternal
) => {
  if (!redirectConfigInternal.name) {
    throw new Error(
      `Redirect ${filename} is missing a "name" in the config function.`
    );
  }

  if (redirectConfigInternal.streamId && redirectConfigInternal.stream) {
    throw new Error(
      `Redirect ${filename} must not define both a "streamId" and a "stream".`
    );
  }
};
