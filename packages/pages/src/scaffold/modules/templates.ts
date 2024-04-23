import { ProjectStructure } from "../../common/src/project/structure.js";

export const formatModuleName = (moduleName: string): string => {
  return moduleName
    .replace(/[-]+(\w)/g, (_, char) => char.toUpperCase()) // if there's a hyphen, remove and make PascalCase
    .replace(/^\w/, (char) => char.toUpperCase()); // first char is uppercased
};

export const moduleCode = (
  moduleName: string,
  useTailwind: boolean
): string => {
  const tailwind = useTailwind ? ` className="tailwind"` : ``;
  const formattedModuleName = formatModuleName(moduleName);

  return `import { Module, ModuleConfig, ModuleProps } from "@yext/pages/*";
import { AnalyticsProvider } from "@yext/pages-components";
import "./index.css";

const templateData: ModuleProps = {
  document: {
    businessId: "REPLACE_ME",
    siteId: "REPLACE_ME",
    __: {
      name: "${moduleName}",
      staticPage: true
    }
  }, 
  __meta: {
    mode: "production"
  }
}

export const config: ModuleConfig = {
  name: "${moduleName}"
}

const ${formattedModuleName}: Module = () => {
  return(
    <AnalyticsProvider 
      apiKey="REPLACE_ME"
      defaultCurrency="REPLACE_ME" 
      templateData={templateData}
      productionDomains={["REPLACE_ME"]}
    >
      <div${tailwind}>
        Module
      </div>
    </AnalyticsProvider>
  )
}

export default ${formattedModuleName};
`;
};

export const postcssCode = (): string => {
  return `import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  plugins: {
    tailwindcss: { config: path.join(__dirname, 'tailwind.config.ts')},
    autoprefixer: {},
  },
};
`;
};

export const indexCssCode = (useTailwind: boolean): string => {
  return useTailwind
    ? `.tailwind {
  @tailwind base;
  @tailwind components;
  @tailwind utilities;  
}
`
    : ``;
};

export const tailwindCode = (projectStructure: ProjectStructure) => {
  return `import type { Config } from 'tailwindcss';

export default {
  content: ["./${projectStructure.config.rootFolders.source}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
`;
};
