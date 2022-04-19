import { useState } from 'react';
import fetch from "cross-fetch";

export const config = {
  name: 'static',
};

export const getPath = (data: any) => {
  return `static/${Math.random().toString()}`;
};

export const getStaticProps: any = async () => {
  const url = `https://pokeapi.co/api/v2/pokemon/1`;
  const pokemon = await fetch(url)
    .then(res => res.json());

  return pokemon;
};

const Static = ({ data }: { data: any }) => {
  const { document } = data;
  const { streamOutput } = document;
  const { name } = streamOutput;

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
