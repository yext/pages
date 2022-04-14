import { createContext, useContext } from 'react';
import { Page } from './ssr/types.js';

type Route = {
  name: string;
  path: string;
  getComponent: () => Promise<any>;
};

// Can't use string interpolation here so src/templates is hardcoded
const templates = import.meta.glob('/src/templates/*.(jsx|tsx)');

export const routes: Route[] = Object.keys(templates).map((path) => {
  return {
    // get the filename from the path and remove its extension, default to index
    name: path.split('/').pop()?.split('.')[0] || 'index',
    path,
    getComponent: templates[path],
  };
});

type ReactSitesScriptsContextType = {
  activePage: Page | undefined;
  setActivePage: (page: Page) => void;
};

export const ReactSitesContext = createContext<ReactSitesScriptsContextType>({} as any);

const getServerData = async (to: any) => {
  const res = await fetch(`/data/${to}`);
  return await res.json();
};

export const useReactSitesScripts = () => {
  const { setActivePage } = useContext(ReactSitesContext);

  return {
    navigate: async (to: string) => {
      const [props, { default: component }] = await Promise.all([
        getServerData(to),
        await routes.find((route) => route.path === to)?.getComponent(),
      ]);

      setActivePage({ path: to, component, props });
      history.pushState(null, '', to);
    },
  };
};
