/**
 * modified from https://github.com/vitejs/vite/blob/main/scripts/releaseUtils.ts
 */
import { existsSync, writeFileSync } from "fs";
import path from "path";
import colors from "picocolors";
import type { Options as ExecaOptions, ExecaReturnValue } from "execa";
import { execa } from "execa";
import type { ReleaseType } from "semver";
import semver from "semver";
import fs from "fs-extra";
import minimist from "minimist";
import { fileURLToPath } from "url";

export const args = minimist(process.argv.slice(2));

export const isDryRun = !!args.dry;

if (isDryRun) {
  console.log(colors.inverse(colors.yellow(" DRY RUN ")));
  console.log();
}

export const packages = ["pages"];

export const versionIncrements: ReleaseType[] = ["patch", "minor", "major"];

interface Pkg {
  name: string;
  version: string;
  private?: boolean;
}
export async function getPackageInfo(pkgName: string): Promise<{
  pkg: Pkg;
  pkgName: string;
  pkgDir: string;
  pkgPath: string;
  currentVersion: string;
}> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pkgDir = path.resolve(__dirname, "../packages/" + pkgName);

  if (!existsSync(pkgDir)) {
    console.error(`Package ${pkgName} not found`);
    process.exit(1);
  }

  const pkgPath = path.resolve(pkgDir, "package.json");
  const pkg: Pkg = await import(pkgPath);

  const currentVersion = pkg.version;

  if (pkg.private) {
    console.error(`Package ${pkgName} is private`);
    process.exit(1);
  }

  return {
    pkg,
    pkgName,
    pkgDir,
    pkgPath,
    currentVersion,
  };
}

export async function run(
  bin: string,
  args: string[],
  opts: ExecaOptions<string> = {}
): Promise<ExecaReturnValue<string>> {
  return execa(bin, args, { stdio: "inherit", ...opts });
}

export async function dryRun(
  bin: string,
  args: string[],
  opts?: ExecaOptions<string>
): Promise<void> {
  return console.log(
    colors.blue(`[dryrun] ${bin} ${args.join(" ")}`),
    opts || ""
  );
}

export const runIfNotDry = isDryRun ? dryRun : run;

export function step(msg: string): void {
  return console.log(colors.cyan(msg));
}

interface VersionChoice {
  title: string;
  value: string;
}
export function getVersionChoices(currentVersion: string): VersionChoice[] {
  const currentBeta = currentVersion.includes("beta");
  const currentAlpha = currentVersion.includes("alpha");
  const isStable = !currentBeta && !currentAlpha;

  function inc(i: ReleaseType, tag = currentAlpha ? "alpha" : "beta") {
    return semver.inc(currentVersion, i, tag)!;
  }

  let versionChoices: VersionChoice[] = [
    {
      title: "next",
      value: inc(isStable ? "patch" : "prerelease"),
    },
  ];

  if (isStable) {
    versionChoices.push(
      {
        title: "beta-minor",
        value: inc("preminor"),
      },
      {
        title: "beta-major",
        value: inc("premajor"),
      },
      {
        title: "alpha-minor",
        value: inc("preminor", "alpha"),
      },
      {
        title: "alpha-major",
        value: inc("premajor", "alpha"),
      },
      {
        title: "minor",
        value: inc("minor"),
      },
      {
        title: "major",
        value: inc("major"),
      }
    );
  } else if (currentAlpha) {
    versionChoices.push({
      title: "beta",
      value: inc("patch") + "-beta.0",
    });
  } else {
    versionChoices.push({
      title: "stable",
      value: inc("patch"),
    });
  }
  versionChoices.push({ value: "custom", title: "custom" });

  versionChoices = versionChoices.map((i) => {
    i.title = `${i.title} (${i.value})`;
    return i;
  });

  return versionChoices;
}

export function updateVersion(pkgPath: string, version: string): void {
  const pkg = fs.readJSONSync(pkgPath);
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

export async function publishPackage(
  pkdDir: string,
  tag?: string
): Promise<void> {
  const publicArgs = ["publish", "--access", "public"];
  if (tag) {
    publicArgs.push(`--tag`, tag);
  }
  await runIfNotDry("npm", publicArgs, {
    cwd: pkdDir,
  });
}

export async function getLatestTag(pkgName: string): Promise<string> {
  const tags = (await run("git", ["tag"], { stdio: "pipe" })).stdout
    .split(/\n/)
    .filter(Boolean);
  const prefix = `${pkgName}@`;
  return tags
    .filter((tag) => tag.startsWith(prefix))
    .sort()
    .reverse()[0];
}

export async function logRecentCommits(pkgName: string): Promise<void> {
  const tag = await getLatestTag(pkgName);
  if (!tag) return;
  const sha = await run("git", ["rev-list", "-n", "1", tag], {
    stdio: "pipe",
  }).then((res) => res.stdout.trim());
  console.log(
    colors.bold(
      `\n${colors.blue(`i`)} Commits of ${colors.green(
        pkgName
      )} since ${colors.green(tag)} ${colors.gray(`(${sha.slice(0, 5)})`)}`
    )
  );
  await run(
    "git",
    [
      "--no-pager",
      "log",
      `${sha}..HEAD`,
      "--oneline",
      "--",
      `packages/${pkgName}`,
    ],
    { stdio: "inherit" }
  );
  console.log();
}
