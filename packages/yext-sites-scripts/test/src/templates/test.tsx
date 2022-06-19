import React, { useState } from "react";
import {
  Data,
  Default,
  GetPath,
  TemplateConfig,
  Render,
} from "@yext/yext-sites-scripts";

export const config: TemplateConfig = {
  name: "Product Test",
  stream: {
    $id: "products",
    fields: ["name", "meta", "id", "uid"],
    filter: {
      entityTypes: ["location"],
    },
    localization: {
      locales: ["en"],
      primary: false,
    },
  },
};

const Test: Default<Data> = (data) => {
  const { document } = data;
  const { name } = document;

  const [num, setNum] = useState<number>(0);

  return (
    <>
      <div>Hello from {name} wooo</div>
      <button onClick={() => setNum(num + 1)}>Click me</button>
      Num: {num}
    </>
  );
};

export default Test;

export const getPath: GetPath<Data> = (data) => {
  return "";
};

export const render: Render<Data> = (data) => {
  return "";
};
