import { Response } from "express-serve-static-core";
import page404 from "../public/404.js";

export default function send404(res: Response, errorMsg: string): void {
  console.error(errorMsg);
  res
    .status(404)
    .end(page404.replace("<!-- 404-reason -->", `<h2>${errorMsg}</h2>`));
}
