export const reactWrapper = (
  data: any,
  filename: string,
  template: string,
  hydrate: boolean
): string => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React Page Usings Plugin</title>
        <script>window.__INITIAL__DATA__ = ${JSON.stringify(data)}</script>
        ${getCssTags(
          `src/templates/${filename}`,
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
      ? `<script type="module" src="/assets/hydrate/${getHydrationFilename(
          filename,
          data
        )}.js" defer></script>`
      : ""
  }
    </body>
    </html>`;
};

type chunkName = string;
type bundlerManifest = Record<chunkName, ManifestInfo>;

const getCssTags = (
  filepath: string,
  manifest: bundlerManifest,
  seen: Set<string>
) => {
  const entry = Object.entries(manifest).find(([file]) => file === filepath);
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

const getHydrationFilename = (name: string, data: any) => {
  const { __meta } = data;
  for (const [file, info] of Object.entries(__meta.manifest.bundlerManifest)) {
    if (file !== `dist/hydration_templates/${name}`) {
      continue;
    }
    const originalFile = (info as ManifestInfo).file;
    const filenameIndex = originalFile.lastIndexOf("/") + 1;
    const filename = originalFile.substring(filenameIndex);
    return filename.split(".").slice(0, -1).join(".");
  }
};

type ManifestInfo = {
  file: string;
  src: string;
  isEntry: boolean;
  imports?: string[];
  css: string[];
};
