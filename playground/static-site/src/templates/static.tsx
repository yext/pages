import * as React from "react";
import "../index.css";
import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";

export const config: TemplateConfig = {
  name: "turtlehead-tacos",
};

export const getPath: GetPath<TemplateProps> = () => {
  return `index.html`;
};

const Static = () => {
  return <>Static Page</>;
};

export default Static;
