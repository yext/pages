import { Data, TemplateModule } from "../../../../common/src/template/types";

export const reactWrapper = <T extends Data>(
  data: T,
  templateModule: TemplateModule<any>,
  template: string,
  hydrate: boolean
): string => {
  const projectFilepaths = data.__meta.manifest.projectFilepaths;

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Page Usings Plugin</title>
        <script>window.__INITIAL__DATA__ = ${JSON.stringify(data)}</script>
        ${getCssTags(
          `${projectFilepaths.templatesRoot}/${templateModule.config.name}.tsx`,
          data.__meta.manifest.bundlerManifest,
          new Set()
        )
          .map((f) => `<link rel="stylesheet" href="/${f}"/>`)
          .filter((v, i, a) => a.indexOf(v) == i)
          .join("\n")}
    </head>
    <body>
        <div id="reactele">${template}</div>${
    hydrate
      ? `<script type="module" src="/${findHydrationFilename(
          `${projectFilepaths.hydrationBundleOutputRoot}/${templateModule.config.name}.tsx`,
          data
        )}" defer></script>`
      : ""
  }
    </body>
    </html>`;
};

type chunkName = string;
type bundlerManifest = Record<chunkName, ManifestInfo>;

const reactFilenameRegex = (filepath: string): RegExp =>
  new RegExp(`${filepath}\.([a-z]*)`, "g");

const getCssTags = (
  filepath: string,
  manifest: bundlerManifest,
  seen: Set<string>
) => {
  const entry = Object.entries(manifest).find(([file]) =>
    reactFilenameRegex(filepath).test(file)
  );
  if (!entry) {
    return [];
  }
  const [file, info] = entry;

  seen.add(file);
  const cssFiles = info.css || [];
  (info.imports || [])
    .flatMap((f) => getCssTags(f, manifest, seen))
    .forEach((f) => cssFiles.push(f));

  return cssFiles;
};

const findHydrationFilename = (hydrationFile: string, data: any) => {
  const { __meta } = data;
  for (const [file, info] of Object.entries(__meta.manifest.bundlerManifest)) {
    if (file !== hydrationFile) {
      continue;
    }

    // Return the name of the fingerprinted hydration asset
    return (info as ManifestInfo).file;
  }
};

type ManifestInfo = {
  file: string;
  src: string;
  isEntry: boolean;
  imports?: string[];
  css: string[];
};
