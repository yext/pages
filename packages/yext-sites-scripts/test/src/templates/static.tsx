import React, { useState } from "react";
import fetch from "cross-fetch";
import { Data, TemplateModule } from "@yext/yext-sites-scripts";

export const config = {
  name: "static",
};

type Pokemon = Data & 
  { pokemon: 
    { name: string}
  };

export const getPath: TemplateModule<Pokemon>["getPath"] = (data: Pokemon) => {
  return `static/${Math.random().toString()}`;
};

export const getStaticProps: TemplateModule<Pokemon>["getStaticProps"] = async (data: Data) => {
  const url = `https://pokeapi.co/api/v2/pokemon/1`;
  const pokemon = await fetch(url).then((res) => res.json());

  return { ...data, pokemon: { name: pokemon.name } };
};

const Static: TemplateModule<Pokemon>["default"] = (props: Pokemon) => {
  const { name } = props.pokemon;

  const [num, setNum] = useState<number>(0);

  return (
    <>
      <div>Hello from {name}</div>
      <button onClick={() => setNum(num + 1)}>Click me</button>
      Num: {num}
    </>
  );
};

export default Static;

export const render = () => {};
