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
  return (
    <div className="text-4xl font-bold bg-blue-500 m-4 p-4">Static Page</div>
  );
};

export default Static;
