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
  type ${formattedTemplateName}Props = {};

export const ${fileName}Config: Config<${formattedTemplateName}Props> = {
  components: {},
  root: { 
    render: ({ children }) => {
      return <>{children}</>;
    },
  },
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

export const defaultLayoutData =
  '{"root":{},"zones":{"GridSection-66bcc9f7-603e-4aa3-a8dc-b615e4f1e0f1:column-0":[{"type":"HeadingText","props":{"id":"HeadingText-1d04d138-a53c-4e19-a085-43677225f035","text":{"field":"name","constantValue":"Text","constantValueEnabled":false},"color":"default","level":3,"weight":"default","content":"Heading","fontSize":"default","transform":"none"}},{"type":"HeadingText","props":{"id":"HeadingText-3bbf663f-b3c9-4842-bf42-1189fae9a1d2","text":{"field":"address.city","constantValue":"Text","constantValueEnabled":false},"color":"default","level":1,"weight":"default","content":"Heading","fontSize":"default","transform":"none"}},{"type":"HoursStatus","props":{"id":"HoursStatus-f066f661-eec6-4b5e-b371-9506523c7c41","hours":{"field":"hours","constantValue":{}},"className":"","timeFormat":"12h","showDayNames":true,"dayOfWeekFormat":"long","showCurrentStatus":true}},{"type":"GetDirections","props":{"id":"GetDirections-5553a427-d704-48c2-b34c-79b0001dd052","size":"default","padding":"none","variant":"primary","fontSize":"default","alignment":"items-start","coordinate":{"field":"yextDisplayCoordinate","constantValue":{"latitude":0,"longitude":0}},"borderRadius":"default","getDirectionsProvider":"google"}}],"GridSection-66bcc9f7-603e-4aa3-a8dc-b615e4f1e0f1:column-1":[{"type":"ImageWrapper","props":{"id":"ImageWrapper-dae23d74-7822-4360-91ef-2f20fc9732f6","size":"full","image":{"field":"primaryPhoto","constantValue":{"url":"https://placehold.co/640x360","width":640,"height":360,"alternateText":""},"constantValueEnabled":true},"rounded":"none","aspectRatio":"auto"}}],"GridSection-25304150-7a70-4b16-a7d0-9e5722cb7758:column-0":[{"type":"HeadingText","props":{"id":"HeadingText-664ceccf-fd50-4e44-be5c-cb6281c2c5bf","text":{"field":"","constantValue":"Information","constantValueEnabled":true},"color":"default","level":2,"weight":"default","content":"Heading","fontSize":"default","transform":"none"}},{"type":"Address","props":{"id":"Address-8aff2a9f-6806-45d1-bc0c-529035535242","address":{"field":"address","constantValue":{"city":"","line1":"","region":"","postalCode":"","countryCode":""}},"padding":"none","alignment":"items-start","getDirectionsProvider":"google"}},{"type":"Emails","props":{"id":"Emails-043e6542-8b37-4298-bfec-e666e7880eea","list":{"field":"","constantValue":[]},"listLength":5,"includeHyperlink":true}},{"type":"Phone","props":{"id":"Phone-eeca7da5-9f77-4f81-9167-63d9a10a28eb","phone":{"field":"mainPhone","constantValue":""},"textSize":16}}],"GridSection-25304150-7a70-4b16-a7d0-9e5722cb7758:column-1":[{"type":"HeadingText","props":{"id":"HeadingText-b4cda241-8c87-42d8-8a4b-f8c009f67f2c","text":{"field":"","constantValue":"Hours","constantValueEnabled":true},"color":"default","level":2,"weight":"default","content":"Heading","fontSize":"default","transform":"none"}},{"type":"HoursTable","props":{"id":"HoursTable-3adc65ce-5682-4080-ae30-f763f0b59438","hours":{"field":"hours","constantValue":{}},"padding":"none","alignment":"items-start","startOfWeek":"today","collapseDays":false,"showAdditionalHoursText":true}}],"GridSection-25304150-7a70-4b16-a7d0-9e5722cb7758:column-2":[{"type":"HeadingText","props":{"id":"HeadingText-2298991f-d93e-442b-9a3e-f29e0b79b44f","text":{"field":"","constantValue":"Services","constantValueEnabled":true},"color":"default","level":2,"weight":"default","content":"Heading","fontSize":"default","transform":"none"}},{"type":"TextList","props":{"id":"TextList-2e4b9958-62b1-4574-acc3-ee538244ea48","list":{"field":"services","constantValue":[],"constantValueEnabled":false},"padding":"none"}}]},"content":[{"type":"Header","props":{"logo":{"image":{"field":"","constantValue":{"height":50,"width":50,"url":"https://placehold.co/50"},"constantValueEnabled":true}},"links":[{"cta":{"field":"","constantValue":{"link":"#","label":"Link"},"constantValueEnabled":true}},{"cta":{"field":"","constantValue":{"link":"#","label":"Link"},"constantValueEnabled":true}},{"cta":{"field":"","constantValue":{"link":"#","label":"Link"},"constantValueEnabled":true}}],"id":"Header-86265fdf-58b6-48f2-b956-35c5b459488c"}},{"type":"GridSection","props":{"id":"GridSection-66bcc9f7-603e-4aa3-a8dc-b615e4f1e0f1","columns":[{"verticalAlignment":"start"},{"verticalAlignment":"start"}],"distribution":"auto","backgroundColor":"default","maxContentWidth":"lg","verticalPadding":"py-2","horizontalSpacing":"medium"}},{"type":"GridSection","props":{"id":"GridSection-25304150-7a70-4b16-a7d0-9e5722cb7758","columns":[{"verticalAlignment":"start"},{"verticalAlignment":"start"},{}],"distribution":"auto","backgroundColor":"default","maxContentWidth":"lg","verticalPadding":"py-2","horizontalSpacing":"medium"}},{"type":"Footer","props":{"copyright":{"text":{"field":"","constantValue":"Copyright Text","constantValueEnabled":true}},"links":[{"cta":{"field":"","constantValue":{"link":"#","label":"Footer Link"},"constantValueEnabled":true}},{"cta":{"field":"","constantValue":{"link":"#","label":"Footer Link"},"constantValueEnabled":true}},{"cta":{"field":"","constantValue":{"link":"#","label":"Footer Link"},"constantValueEnabled":true}}],"id":"Footer-062428b8-84a4-421f-862d-a55218900585"}}]}';
