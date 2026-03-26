import * as React from "react";
import { GetPath, Template, TemplateConfig, TemplateProps, TemplateRenderProps } from "@yext/pages";

export const config: TemplateConfig = {
  name: "edit-template-id",
  streamId: "$id",
};

export const getPath: GetPath<TemplateProps> = () => {
  return "edit";
};

const EditTemplate: Template<TemplateRenderProps> = () => {
  return <>Edit</>;
};

export default EditTemplate;
