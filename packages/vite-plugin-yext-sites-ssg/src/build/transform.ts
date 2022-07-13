import { Plugin } from "vite";
import { ProjectStructure } from "../../../common/src/project/structure.js";


// Allow HMR when changes to the default export occur. Without this there is always a full
// page refresh.
const defaultExportCode = `if (import.meta.hot) {
  import.meta.hot.acceptExports(['default']);
}`;

/**
 * This plugin defines how to build the project for production. It bundles
 * assets, copies Yext plugin files that execute the bundled assets in a Deno
 * environment, and puts them all in an output directory.
 */
export const transform = (projectStructure: ProjectStructure): Plugin => {
  return {
    name: "vite-plugin-yext-sites-ssg:transform",
    apply: "serve",

    transform: (code, id) => {
      console.log(id);
      if (id.includes(projectStructure.templatesRoot.path) || id.includes('html-proxy')) {
        console.log('hot');
        return code + defaultExportCode;
      }
      return code;
    },
  };
};

