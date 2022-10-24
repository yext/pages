import shell from "shelljs";
import { CommandModule } from "yargs";

const handler = () => {
  shell.exec("vite preview");
};

export const previewCommandModule: CommandModule = {
  command: "preview",
  describe: "Preview site using Vite",
  handler,
};
