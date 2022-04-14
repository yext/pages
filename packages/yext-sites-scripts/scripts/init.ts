import fs from "fs";
import { runGenerate } from "./init/interface.js";

export default async (folderToCreate: string | null) => {
  if (folderToCreate) {
    await fs.promises.mkdir(folderToCreate);
    process.chdir(folderToCreate);
  } else {
    const files = await fs.promises.readdir(".");
    if (files.length) {
      process.stdout.write(
        "Refusing to generate project: Directory not empty.\n",
      );
      process.exit(1);
    }
  }

  runGenerate();
}
