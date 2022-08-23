import path from "path";
import fs from "fs-extra";
import handlebars from "handlebars";

const hydrationTemplate = `import * as React from "react";
import * as ReactDOM from "react-dom";
import Page from "{{importPath}}";

const data = (window as any).__INITIAL__DATA__;
ReactDOM.hydrate(<Page {...data} />, document.getElementById("reactele"));`;

const genHydrationTemplates = (importPath: string) =>
  handlebars.compile(hydrationTemplate)({ importPath });

/**
 * @param reactTemplates filepaths to all react templates
 *
 */
export const generateHydrationEntryPoints = async (
  reactEntryPoints: string[],
  hydrationOutputDir: string
) => {
  reactEntryPoints.forEach((entrypoint) =>
    generateEntryPoint(entrypoint, hydrationOutputDir)
  );
};

/**
 * Generates a hydration entry-point template for the template at the provided templatePath. If the
 * module does not export Page then nothing is generated.
 *
 * @param templatePath the path of the template to generate a hydration entry-point for.
 */
const generateEntryPoint = (
  templatePath: string,
  hydrationOutputDir: string
) => {
  const basename = path.basename(templatePath);
  const extension = path.extname(templatePath);
  const absoluteTemplatePath = path.resolve(templatePath);

  // Ensure that the import uses proper node file separators. On windows, absolute template path and hydration output dir will use "\"
  // which doesn't work as an import in NodeJS.
  const relPath = path
    .relative(hydrationOutputDir, absoluteTemplatePath)
    .replaceAll("\\", "/");

  const templateBytes = genHydrationTemplates(
    relPath.substring(0, relPath.length - extension.length)
  );
  if (!fs.existsSync(hydrationOutputDir)) {
    fs.mkdirSync(hydrationOutputDir, { recursive: true });
  }
  const outName = basename.substring(0, basename.length - extension.length);
  const outPath = `${hydrationOutputDir}/${outName}.tsx`;
  fs.writeFileSync(outPath, templateBytes, {});
};
