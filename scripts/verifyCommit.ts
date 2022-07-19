// Invoked on the commit-msg git hook by simple-git-hooks.

import { readFileSync } from "fs";
import colors from "picocolors";

// get $1 from commit-msg script
const msgPath = process.argv[2];
const msg = readFileSync(msgPath, "utf-8").trim();

const releaseRE = /^v\d/;
const commitRE =
  /^(revert: )?(feat|fix|docs|refactor|perf|test|workflow|build|ci|chore|types|wip|release|deps)(\(.+\))?: .{1,50}/;

if (!releaseRE.test(msg) && !commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${colors.bgRed(colors.white(" ERROR "))} ${colors.red(
      `invalid commit message format.`
    )}\n\n` +
      colors.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
      ) +
      `    ${colors.green(`feat: a new feature was added`)}\n` +
      `    ${colors.green(`fix: description of fix (close #28)`)}\n` +
      `    ${colors.green(`docs: docs that were updated`)}\n` +
      `    ${colors.green(`refactor: description of refactor`)}\n` +
      `    ${colors.green(`perf: description of peformance change`)}\n` +
      `    ${colors.green(`test: description of added test(s)`)}\n` +
      `    ${colors.green(`workflow: description of workflow change`)}\n` +
      `    ${colors.green(`build: ran build`)}\n` +
      `    ${colors.green(`ci: ci description`)}\n` +
      `    ${colors.green(
        `chore(deps): update all non-major dependencies`
      )}\n` +
      `    ${colors.green(`types: updated foo type`)}\n` +
      `    ${colors.green(`wip: working on foo`)}\n` +
      `    ${colors.green(`release: sites-scripts@1.0.0`)}\n` +
      `    ${colors.green(`deps: removed unused dependency foo`)}\n` +
      `    ${colors.green(`revert: "feat: I broke it"`)}\n\n`
  );
  process.exit(1);
}
