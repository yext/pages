export const visualEditorTemplateCode = (templateName: string): string => {
  const formattedTemplateName =
    templateName.charAt(0).toUpperCase() + templateName.slice(1);
  const config = `${templateName}Config`;

  return `import "@yext/visual-editor/style.css";
import {
  Template,
  GetPath,
  TemplateProps,
  TemplateRenderProps,
  GetHeadConfig,
  HeadConfig,
} from "@yext/pages";
import { Render } from "@measured/puck";
import { ${config} } from "../ve.config";
import { applyTheme, VisualEditorProvider } from "@yext/visual-editor";
import { themeConfig } from "../../theme.config";
import { buildSchema } from "../utils/buildSchema";
import { AnalyticsProvider } from "@yext/pages-components";

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  return {
    title: document.name,
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    tags: [
      {
        type: "link",
        attributes: {
          rel: "icon",
          type: "image/x-icon",
        },
      },
    ],
    other: [applyTheme(document, themeConfig), buildSchema(document)].join(
      "\\n"
    ),
  };
};

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  const localePath = document.locale !== "en" ? \`\${document.locale}/\` : "";
  return document.address
    ? \`\${localePath}\${document.address.region}/\${document.address.city}/\${document.address.line1}-\${document.id.toString()}\`
    : \`\${localePath}\${document.id.toString()}\`;
};

const ${formattedTemplateName}: Template<TemplateRenderProps> = (props) => {
  const { document } = props;

  return (
    <AnalyticsProvider
      // @ts-expect-error ts(2304) the api key will be populated
      apiKey={YEXT_PUBLIC_EVENTS_API_KEY}
      templateData={props}
      currency="USD"
    >
      <VisualEditorProvider document={document}>
        <Render config={${config}} data={JSON.parse(document.__.layout)} />
      </VisualEditorProvider>
    </AnalyticsProvider>
  );
};

export default ${formattedTemplateName};
`;
};

export const newConfigFile = (templateName: string) => {
  const formattedTemplateName =
    templateName.charAt(0).toUpperCase() + templateName.slice(1);

  return `import type { Config } from "@measured/puck";
${newConfig(formattedTemplateName, templateName)}
export const componentRegistry = new Map<string, Config<any>>([
  ["${templateName}",  ${templateName}Config],
]);
`;
};

export const newConfig = (formattedTemplateName: string, fileName: string) => {
  return `
type ${formattedTemplateName}Props = {
};

export const ${fileName}Config: Config<${formattedTemplateName}Props> = {
  components: { },
  root: { },
};

`;
};

export const dynamicTemplate = (
  templateName: string,
  entityScope: string,
  filter: string[]
) => {
  const formattedTemplateName =
    templateName.charAt(0).toUpperCase() + templateName.slice(1);
  const filterCode = `${entityScope}: ${JSON.stringify(filter)},`;

  return `import {
  Template,
  GetPath,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
  GetHeadConfig,
  HeadConfig,
} from "@yext/pages";
 
export const config: TemplateConfig = {
  name: "${templateName}",
  stream: {
    $id: "${templateName}-stream",
    filter: {
      ${filterCode}
    },
    fields: [
      "id",
      "name",
      "slug",
    ],
    localization: {
      locales: ["en"],
    },
  },
};

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  document,
}): HeadConfig => {
  return {
    title: document.name,
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1"
  };
};

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return document.slug ? document.slug : "${templateName}/" + document.id;
};

const ${formattedTemplateName}: Template<TemplateRenderProps> = ({ document }) => {
  console.log(document);
  return (
     <div>${formattedTemplateName} page</div>
  );
};

export default ${formattedTemplateName};
`;
};

export const staticTemplate = (templateName: string) => {
  const formattedTemplateName =
    templateName.charAt(0).toUpperCase() + templateName.slice(1);

  return `import {
  GetPath,
  TemplateProps,
  TemplateRenderProps,
  GetHeadConfig,
  Template,
} from "@yext/pages";
 
export const getPath: GetPath<TemplateProps> = () => {
  return "${templateName}";
};

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = () => {
  return {
    title: "${templateName}",
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
  };
};

const ${formattedTemplateName}: Template<TemplateRenderProps> = () => {
  return (
     <div>${templateName} page</div>
  );
};

export default ${formattedTemplateName};
`;
};

export const veThemeConfig = `
import {
  ThemeConfig,
  defaultFonts,
  FontRegistry,
  getFontWeightOptions,
  constructFontSelectOptions,
} from "@yext/visual-editor";

const getColorOptions = () => {
  return [
    { label: "Primary", value: "var(--colors-palette-primary)" },
    { label: "Secondary", value: "var(--colors-palette-secondary)" },
    { label: "Accent", value: "var(--colors-palette-accent)" },
    { label: "Text", value: "var(--colors-palette-text)" },
    { label: "Background", value: "var(--colors-palette-background)" },
  ];
};

const fonts: FontRegistry = {
  // other developer defined fonts here
  ...defaultFonts,
};
const fontOptions = constructFontSelectOptions(fonts);
const fontWeightOptions = (fontVariable?: string) => {
  return () =>
    getFontWeightOptions({
      fontCssVariable: fontVariable,
      fontList: fonts,
    });
};

export const themeConfig: ThemeConfig = {
  palette: {
    label: "Color Palette",
    styles: {
      primary: {
        label: "Primary",
        type: "color",
        default: "#D83B18",
        plugin: "colors",
      },
      secondary: {
        label: "Secondary",
        type: "color",
        default: "#FFFFFF",
        plugin: "colors",
      },
      accent: {
        label: "Accent",
        type: "color",
        default: "#FFFFFF",
        plugin: "colors",
      },
      text: {
        label: "Text",
        type: "color",
        default: "#000000",
        plugin: "colors",
      },
      background: {
        label: "Background",
        type: "color",
        plugin: "colors",
        default: "#FFFFFF",
      },
    },
  },
  heading1: {
    label: "Heading 1",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 48,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-heading1-fontFamily"),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Georgia', serif",
      },
    },
  },
  heading2: {
    label: "Heading 2",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-heading2-fontFamily"),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "serif",
      },
    },
  },
  heading3: {
    label: "Heading 3",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-heading3-fontFamily"),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "serif",
      },
    },
  },
  heading4: {
    label: "Heading 4",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-heading4-fontFamily"),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "serif",
      },
    },
  },
  heading5: {
    label: "Heading 5",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-heading5-fontFamily"),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "serif",
      },
    },
  },
  heading6: {
    label: "Heading 6",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 24,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-heading6-fontFamily"),
        default: "700",
      },
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "serif",
      },
    },
  },
  body: {
    label: "Body Text",
    styles: {
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 16,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-body-fontFamily"),
        default: "400",
      },
      color: {
        label: "Text Color",
        plugin: "colors",
        type: "select",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "serif",
      },
    },
  },
  grid: {
    label: "Grid Section",
    styles: {
      verticalSpacing: {
        label: "Vertical Spacing",
        type: "number",
        plugin: "gap",
        default: 8,
      },
      maxWidth: {
        label: "Maximum Width",
        type: "select",
        plugin: "maxWidth",
        options: [
          { label: "2XL", value: "1536px" },
          { label: "XL", value: "1280px" },
          { label: "LG", value: "1024px" },
        ],
        default: "1280px",
      },
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
    },
  },
  header: {
    label: "Header",
    styles: {
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
    },
  },
  footer: {
    label: "Footer",
    styles: {
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
    },
  },
  button: {
    label: "Button",
    styles: {
      borderRadius: {
        label: "Border Radius",
        type: "number",
        plugin: "borderRadius",
        default: 20,
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-body-fontFamily"),
        default: "400",
      },
      fontSize: {
        label: "Font Size",
        type: "number",
        plugin: "fontSize",
        default: 12,
      },
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
      textColor: {
        label: "Text Color",
        plugin: "colors",
        type: "select",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
    },
  },
};
`;

export const buildSchemaUtil = `
import { SchemaWrapper, LocalBusiness } from "@yext/pages-components";

export function buildSchema(document: Record<string, any>) {
  const localBusiness = document.address && {
    ...LocalBusiness(document),
    paymentAccepted: document.paymentOptions,
    makesOffer: document.services,
  };

  const json = {
    "@graph": [localBusiness].filter(Boolean),
  };

  return SchemaWrapper(json);
}
`;

export const tailwindConfig = `
import type { Config } from "tailwindcss";
import { themeConfig } from "./theme.config";
import { themeResolver } from "@yext/visual-editor";

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./node_modules/@yext/visual-editor/dist/**/*.js",
  ],
  theme: {
    extend: themeResolver({}, themeConfig),
  },
  plugins: [],
} satisfies Config;
`;
