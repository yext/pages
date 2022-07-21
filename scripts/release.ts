/**
 * modified from https://github.com/vitejs/vite/blob/main/scripts/release.ts
 */
import prompts from "prompts";
import semver from "semver";
import colors from "picocolors";
import {
  args,
  getPackageInfo,
  getVersionChoices,
  isDryRun,
  logRecentCommits,
  packages,
  run,
  runIfNotDry,
  step,
  updateVersion,
} from "./releaseUtils";

let targetVersion: string | undefined;

const { pkg }: { pkg: string } = await prompts({
  type: "select",
  name: "pkg",
  message: "Select package",
  choices: packages.map((i) => ({ value: i, title: i })),
});

if (!pkg) process.exit();

await logRecentCommits(pkg);

const { currentVersion, pkgName, pkgPath, pkgDir } = await getPackageInfo(pkg);

if (!targetVersion) {
  const { release }: { release: string } = await prompts({
    type: "select",
    name: "release",
    message: "Select release type",
    choices: getVersionChoices(currentVersion),
  });

  if (release === "custom") {
    const res: { version: string } = await prompts({
      type: "text",
      name: "version",
      message: "Input custom version",
      initial: currentVersion,
    });
    targetVersion = res.version;
  } else {
    targetVersion = release;
  }
}

if (!semver.valid(targetVersion)) {
  console.error(`invalid target version: ${targetVersion}`);
  process.exit(1);
}

const tag = `${pkgName}@${targetVersion}`;

if (targetVersion.includes("beta") && !args.tag) {
  args.tag = "beta";
}
if (targetVersion.includes("alpha") && !args.tag) {
  args.tag = "alpha";
}

const { yes }: { yes: boolean } = await prompts({
  type: "confirm",
  name: "yes",
  message: `Releasing ${colors.yellow(tag)} Confirm?`,
});

if (!yes) {
  process.exit();
}

step("\nUpdating package version...");
updateVersion(pkgPath, targetVersion);

step("\nGenerating changelog...");
const changelogArgs = [
  "conventional-changelog",
  "-p",
  "angular",
  "-i",
  "CHANGELOG.md",
  "-s",
  "--commit-path",
  ".",
];

await run("npx", changelogArgs, { cwd: pkgDir });

const { stdout } = await run("git", ["diff"], { stdio: "pipe" });
if (stdout) {
  step("\nCommitting changes...");
  await runIfNotDry("git", ["add", "-A"]);
  await runIfNotDry("git", ["commit", "-m", `release: ${tag}`]);
  await runIfNotDry("git", ["tag", tag]);
} else {
  console.log("No changes to commit.");
  process.exit();
}

step("\nPushing to GitHub...");
await runIfNotDry("git", ["push", "origin", `refs/tags/${tag}`]);
await runIfNotDry("git", ["push"]);

if (isDryRun) {
  console.log(`\nDry run finished - run git diff to see package changes.`);
} else {
  console.log(
    colors.green(
      "\nPushed, publishing should starts shortly on CI.\nhttps://github.com/yext/pages/.github/workflows/publish.yml"
    )
  );
}

console.log();
