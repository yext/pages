import { Page } from "./ssr/types.js";
import { createElement } from "react";

type Props = {
  page?: Page;
};

export const App = ({ page }: Props) => {
  return createElement(page?.component, page?.props);
};
