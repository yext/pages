// TODO: Use new resolveData (or similar function) in transformProps
export const visualEditorTemplateCode = (
  templateName: string,
  fileName: string,
  entityScope: string,
  filter: string[]
): string => {
  const formattedTemplateName =
    fileName.charAt(0).toUpperCase() + fileName.slice(1);
  const filterCode = `${entityScope}: ${JSON.stringify(filter)},`;
  const config = `${fileName}Config`;

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
import { getTemplatePuckData } from "../utils/puckDataHelper";

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
  try {
    const templateData = getTemplatePuckData(
      entityConfigurations,
      entityLayoutConfigurations,
      siteLayoutConfigurations,
      config.name,
    );
    const visualTemplate = JSON.parse(templateData);
    return {
      ...data,
      document: {
        ...document,
        visualTemplate,
      },
    };
  } catch (error) {
    console.error("Failed to parse visualTemplate: " + error);
    return data;
  }
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
  return document.slug ? document.slug : "${fileName}/" + document.id;
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

export const newConfigFile = (templateName: string, fileName: string) => {
  const formattedTemplateName =
    fileName.charAt(0).toUpperCase() + fileName.slice(1);

  return `import type { Config } from "@measured/puck";
${newConfig(formattedTemplateName, fileName)}
export const puckConfigs = new Map<string, Config<any>>([
  ["${templateName}",  ${fileName}Config],
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
