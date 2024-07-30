export const visualEditorTemplateCode = (
  templateName: string,
  entityScope: string,
  filter: string[]
): string => {
  const formattedTemplateName =
    templateName.charAt(0).toUpperCase() + templateName.slice(1);
  const filterCode = `${entityScope}: ${JSON.stringify(filter)},`;
  const config = `${templateName}Config`;

  return `import {
  Template,
  GetPath,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
  GetHeadConfig,
  HeadConfig,
} from "@yext/pages";
import { Config, Render } from "@measured/puck";
import { ${config} } from "../ve.config";
import { DocumentProvider } from "../hooks/useDocument";
import { resolveVisualEditorData } from "@yext/visual-editor";

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
      "c_visualConfigurations",
      "c_pages_layouts.c_visualConfiguration",
    ],
    localization: {
      locales: ["en"],
    },
  },
  additionalProperties: {
    isVETemplate: true,
    isDraft: true,
  }
};

export const transformProps = async (data) => {
  const { document } = data;
  const entityConfigurations = document.c_visualConfigurations ?? [];
  const entityLayoutConfigurations = document.c_pages_layouts ?? [];
  const siteLayoutConfigurations = document._site?.c_visualLayouts;
  const visualTemplate = resolveVisualEditorData(entityConfigurations, entityLayoutConfigurations, siteLayoutConfigurations, ${formattedTemplateName});
  return {
    ...data,
    document: {
      ...document,
      visualTemplate,
    },
  };
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
  const { visualTemplate } = document;
  return (
    <DocumentProvider value={document}>
      <Render config={${config} as Config} data={visualTemplate} />
    </DocumentProvider>
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
export const puckConfigs = new Map<string, Config<any>>([
  ["${templateName}",  ${templateName}Config],
]);
`;
};

export const newConfig = (formattedTemplateName: string, fileName: string) => {
  return `
// eslint-disable-next-line @typescript-eslint/ban-types
type ${formattedTemplateName}Props = {
};

export const ${fileName}Config: Config<${formattedTemplateName}Props> = {
  components: { },
  root: { },
};

`;
};
