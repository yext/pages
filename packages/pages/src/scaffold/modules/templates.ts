export const moduleCode = (
  moduleName: string,
  isUsingTailwind: boolean
): string => {
  const tailwind = isUsingTailwind ? ` className="tailwind"` : ``;
  const formattedModuleName =
    moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  return `import { Module, ModuleConfig } from "@yext/pages/*";
import "./index.css";

export const config: ModuleConfig = {
  name: "${moduleName}"
}

const ${formattedModuleName}: Module = () => {
  return(
    <div${tailwind}>
    </div>
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
