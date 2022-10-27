import React, { PropsWithChildren } from "react";
import { concatScopes } from "./helpers.js";
import { AnalyticsScopeProps } from "./interfaces.js";

const ScopeContext = React.createContext({ name: "" });

/**
 * The useScope hook will return the current scope from the Analytics Scope. For
 * use within the context of an AnalyticsScopeProvider for scoping analytics events.
 */
export const useScope = () => {
  const ctx = React.useContext(ScopeContext);
  return ctx.name;
};

/**
 * The AnalyticsScopeProvider will allow you to pre-pend a given string to all
 * events that happen in the node tree below where setScope is called.
 * For example, if you call setScope('header') and there is an `a` element
 * below whose onClick calls `track('my link')` the calculated event name
 * that will be sent to Yext Analytics is `header_mylink`
 *
 * @param props - AnalyticsScopeProps
 */
export function AnalyticsScopeProvider(
  props: PropsWithChildren<AnalyticsScopeProps>
): JSX.Element {
  const parentScope = useScope();
  const combinedScope = concatScopes(parentScope, props.name);

  return (
    <ScopeContext.Provider value={{ name: combinedScope }}>
      {props.children}
    </ScopeContext.Provider>
  );
}
