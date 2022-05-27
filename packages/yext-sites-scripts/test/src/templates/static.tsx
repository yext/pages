import React, { useState } from "react";
import fetch from "cross-fetch";
import {
  Data,
  Default,
  GetPath,
  GetStaticProps,
  Render,
} from "@yext/yext-sites-scripts";

export const config = {
  name: "static",
};

type Pokemon = Data & { pokemon: { name: string } };

export const getPath: GetPath<Pokemon> = (data) => {
  return `static/${Math.random().toString()}`;
};

export const getStaticProps: GetStaticProps<Pokemon> = async (data: Data) => {
  const url = `https://pokeapi.co/api/v2/pokemon/1`;
  const pokemon = await fetch(url).then((res) => res.json());

  return { ...data, pokemon: { name: pokemon.name } };
};

const Static: Default<Pokemon> = (data) => {
  const { name } = data.pokemon;

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

export const render: Render<Pokemon> = (data) => {
  return "";
};
