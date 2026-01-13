import * as React from "react";
import { GetPath, Template, TemplateConfig, TemplateProps, TemplateRenderProps } from "@yext/pages";
import "../../index.css";

/**
 * Required when Knowledge Graph data is used for a template.
 */
export const config: TemplateConfig = {
  stream: {
    $id: "oakley-stream",
    // Specifies the exact data that each generated document will contain. This data is passed in
    // directly as props to the default exported function.
    fields: ["id", "name", "slug"],
    // Defines the scope of entities that qualify for this stream.
    filter: {
      savedFilterIds: ["1241548641"],
    },
    // The entity language profiles that documents will be generated for.
    localization: {
      locales: ["en"],
      primary: false,
    },
  },
};

/**
 * Defines the path that the generated file will live at for production.
 *
 * NOTE: To preview production URLs locally, you must return document.slug from this function
 * and ensure that each entity has the slug field pouplated.
 */
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return document.slug ? document.slug : document.name;
};

/**
 * This is the main template. It can have any name as long as it's the default export.
 * The props passed in here are the direct stream document defined by `config`.
 */
const Sunglasses: Template<TemplateRenderProps> = ({ document }) => {
  const { name } = document;

  return <div className="text-4xl font-bold bg-green-500 m-4 p-4">{name}</div>;
};

export default Sunglasses;
