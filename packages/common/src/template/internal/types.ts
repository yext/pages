import {
  Default,
  GetPath,
  GetStaticProps,
  Render,
  Stream,
  TemplateConfig,
  TemplateModule,
} from "../types";
import { validateTemplateModuleInternal } from "./validateTemplateModuleInternal";

/**
 * A domain representation of a template module. Contains all fields from an imported module as well
 * as metadata about the module used in downstream processing.
 */
export interface TemplateModuleInternal<T> {
  /**
   * The filepath to the template file. This can be the raw TSX file when used during dev mode or
   * the path to the server bundle this module was imported from during prod build.
   */
  path: string;
  /** The name of the file (with extension) */
  filename: string;
  /** The name of the file (without extension) */
  templateName: string;
  /** The exported config function */
  config: TemplateConfigInternal;
  /** The optional exported getStaticProps function */
  getStaticProps?: GetStaticProps<T>;
  /** The exported getPath function */
  getPath: GetPath<T>;
  /** The exported render function */
  render?: Render<T>;
  /** The exported default function */
  default: Default<T>;
}

/**
 * The exported `config` function's definition.
 */
export interface TemplateConfigInternal {
  /** The name of the template feature. If not defined uses the template filename (without extension) */
  name: string;
  /** The stream that this template uses. If a stream is defined the streamId is not required. */
  streamId?: string;
  /** The stream configuration used by the template */
  stream?: Stream;
}

/**
 * Parses a filepath and returns the relevant parts, such as the base filename.
 */
const parse = (filepath: string, adjustForFingerprintedAsset: boolean) => {
  let base = filepath.split("/")[filepath.split("/").length - 1];
  const extension = base.slice(base.lastIndexOf("."));
  let name = base.slice(0, base.lastIndexOf("."));

  // Removes the fingerprint portion (for server bundles)
  if (adjustForFingerprintedAsset) {
    base =
      base
        .split(extension)[0]
        .slice(0, base.split(extension)[0].lastIndexOf(".")) + extension;
    name = name.slice(0, name.lastIndexOf("."));
  }

  return {
    base, // the root file with extension
    name, // the root file without extension
  };
};

export const convertTemplateModuleToTemplateModuleInternal = (
  templateFilepath: string,
  templateModule: TemplateModule<any>,
  adjustForFingerprintedAsset: boolean
): TemplateModuleInternal<any> => {
  const templatePath = parse(templateFilepath, adjustForFingerprintedAsset);

  const templateModuleInternal = {
    ...templateModule,
    config: convertTemplateConfigToTemplateConfigInternal(
      templatePath.name,
      templateModule.config
    ),
    path: templateFilepath,
    filename: templatePath.base,
    templateName: templatePath.name,
  };

  validateTemplateModuleInternal(templateModuleInternal);

  return templateModuleInternal;
};

const convertTemplateConfigToTemplateConfigInternal = (
  templateName: string,
  templateConfig: TemplateConfig | undefined
): TemplateConfigInternal => {
  return {
    name: templateConfig?.name ?? templateName,
    ...templateConfig,
  };
};
