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
  // temporary: guard for generated repo-based static page
  if (!document?.__?.layout) {
    return <></>;
  }

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
