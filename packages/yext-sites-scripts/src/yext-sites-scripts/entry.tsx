import { createElement, FC } from 'react';
import { Props } from './clientHydrate'

export const App: FC<Props> = ({ page }: Props) => {
  return createElement(page?.component, page?.props);
};