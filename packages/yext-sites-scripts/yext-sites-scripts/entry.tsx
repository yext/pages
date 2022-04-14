import ReactDOM from 'react-dom';
import { Page } from './ssr/types.js';
import React, { createElement } from 'react';

type Props = {
  page?: Page;
};

export const App = ({ page }: Props) => {
  // let [activePage, setActivePage] = useState(page);

  // return (
  //   <ReactSitesContext.Provider value={{ activePage, setActivePage }}>
  //     {createElement(page?.component, page?.props)}
  //   </ReactSitesContext.Provider>
  // );

  return createElement(page?.component, page?.props);
};

const hydrate = async () => {
  type Route = {
    name: string;
    path: string;
    getComponent: () => Promise<any>;
  };

  // Can't use string interpolation here so src/templates is hardcoded
  const templates = import.meta.glob('/src/templates/*.(jsx|tsx)');

  const routes: Route[] = Object.keys(templates).map((path) => {
    return {
      // get the filename from the path and remove its extension, default to index
      name: path.split('/').pop()?.split('.')[0] || 'index',
      path,
      getComponent: templates[path],
    };
  });

  /**
   * Get the templateFilename from the template. See {@link ./ssr/serverRenderRoute.ts}.
   */
  const templateFilename = (window as any)._RSS_TEMPLATE_?.split('.')[0];

  const { default: component } = (await routes.find((route) => route.name === templateFilename)?.getComponent()) || {};

  ReactDOM.hydrate(
    <App
      page={{
        props: (window as any)._RSS_PROPS_,
        path: window.location.pathname,
        component,
      }}
    />,
    document.getElementById('root'),
  );
};

if (!import.meta.env.SSR) hydrate();
