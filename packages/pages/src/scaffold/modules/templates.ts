export const moduleCode = (
  moduleName: string,
  isUsingTailwind: boolean
): string => {
  const tailwind = isUsingTailwind ? ` className="tailwind"` : ``;
  const formattedModuleName =
    moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return `import { Module, ModuleConfig, ModuleProps } from "@yext/pages/*";
import { AnalyticsProvider } from "@yext/pages-components";
import "./index.css";

const templateData: ModuleProps = {
  document: {
    businessId: "REPLACE_ME",
    siteId: "REPLACE_ME",
    apiKey: "REPLACE_ME",
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
    <AnalyticsProvider templateData={templateData}>
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

export const indexCssCode = (isUsingTailwind: boolean): string => {
  return isUsingTailwind
    ? `.tailwind {
  @tailwind base;
}

@tailwind components;
@tailwind utilities;  
`
    : ``;
};

export const tailwindCode = () => {
  return `import type { Config } from 'tailwindcss';

export default {
  content: ["./**/*.{js,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
`;
};
