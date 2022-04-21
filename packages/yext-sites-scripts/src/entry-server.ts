import { createServer } from "./dev/server/server.js";

const [, , ...args] = process.argv;

if (args.some(arg => ["dynamic"].includes(arg))) {
  await createServer(true);
} else {
  await createServer(false);
}

