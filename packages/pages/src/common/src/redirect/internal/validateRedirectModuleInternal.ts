import { RedirectConfigInternal, RedirectModuleInternal } from "./types.js";

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
};

export const validateConfig = (
  filename: string,
  redirectConfigInternal: RedirectConfigInternal
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
