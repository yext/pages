import * as React from "react";
import { GetPath, Template, TemplateProps, TemplateRenderProps } from "@yext/pages";

export const getPath: GetPath<TemplateProps> = () => {
  return "location";
};

const LocationTemplate: Template<TemplateRenderProps> = () => {
  return <>Location</>;
};

export default LocationTemplate;
