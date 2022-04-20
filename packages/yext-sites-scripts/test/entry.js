import { createElement } from "react";
import { hydrate } from '@yext/yext-sites-scripts';

export const App = ({ page }) => {
  return createElement(page?.component, page?.props);
};

if (!import.meta.env.SSR) hydrate(App);
