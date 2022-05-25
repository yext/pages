import React, { useState } from "react";

export const config = {
  name: "Product Test",
  stream: {
    $id: "products",
    fields: ["name", "meta", "id", "uid"],
    filter: {
      entityTypes: ["location"],
    },
  },
};

const Test = (props: any) => {
  const { document } = props;
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

export const getPath = () => {};

export const render = () => {};
