import React, { useState } from "react";
import { Data, TemplateModule } from "@yext/yext-sites-scripts";

export const config: TemplateModule<Data>["config"] = {
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

const Test: TemplateModule<Data>["default"] = (data: Data) => {
  const { document } = data;
  const { streamOutput } = document;
  const { name } = streamOutput;

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

export const getPath: TemplateModule<Data>["getPath"] = (data: Data) => {
  return "";
};

export const render = () => {};
