import { createServer } from "./server/server";

export default async () => {
  const [, , ...args] = process.argv;

  if (args.some(arg => ["dynamic"].includes(arg))) {
    await createServer(true);
  } else {
    await createServer(false);
  }
};