import { createServer } from "./server/server.js";
import open from "open";

export default async () => {
  const [, , ...args] = process.argv;

  if (args.some((arg) => ["dynamic"].includes(arg))) {
    await createServer(true);
  } else {
    await createServer(false);
  }

  await open(
    "http://localhost:3000/replaceWithTemplateName/replaceWithEntityId"
  );
};
