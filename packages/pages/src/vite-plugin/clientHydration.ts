import { Plugin } from "vite";
import {
  clientTemplateQuery,
  generateClientTemplate,
} from "../common/src/template/client.js";

export const clientHydration = (): Plugin => ({
  name: "client-hydration:build",
  apply: "build",
  enforce: "pre",
  resolveId(id) {
    if (id.endsWith(clientTemplateQuery)) {
      return id;
    }
  },
  load(id) {
    if (id.endsWith(clientTemplateQuery)) {
      const templatePath = id.slice(0, -clientTemplateQuery.length);
      this.addWatchFile(templatePath);
      return generateClientTemplate(templatePath);
    }
  },
});
