import { args, getPackageInfo, publishPackage, step } from "./releaseUtils.js";

const tag = args._[0];

if (!tag) {
  console.error("No tag specified");
  process.exit(1);
}

const [pkgName, version] = tag.split("@");

const { currentVersion, pkgDir } = await getPackageInfo(pkgName);
if (currentVersion !== version) {
  console.error(
    `Package version from tag "${version}" mismatches with current version "${currentVersion}"`
  );
  process.exit(1);
}

step("Publishing package...");
const releaseTag = version.includes("beta")
  ? "beta"
  : version.includes("alpha")
    ? "alpha"
    : undefined;
await publishPackage(pkgDir, releaseTag);
