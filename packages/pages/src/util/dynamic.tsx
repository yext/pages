import * as React from "react";

export type DynamicOptions = {
  /** The exported component to use if it's a named export. Uses the "default" export otherwise. */
  componentName?: string;
  /** A function that returns a react element to display before the dynamic import is fully loaded. */
  loading?: () => React.JSX.Element;
};

/**
 * A component that will dynamically load an import, similar to React 18's lazy component. If no componentName
 * is set then "default" will be used. It also provides a loading state that is displayed before the
 * dynamic import is fully loaded.
 *
 * Example usage
 * ```
 * const MyMarkdown = asyncComponent(() => import("@yext/pages-components"), {componentName: "Markdown"});
 * <MyMarkdown content="my content" />
 *
 * const SliderComponent = dynamic(() => import("react-slick"), {
 *   loading: () => <h1>hi</h1>,
 * });
 * ```
 *
 * @param importComponent - A dynamic import function.
 * @param options - {@link DynamicOptions}
 * @returns
 */
export function dynamic(
  importComponent: () => Promise<any>,
  options?: DynamicOptions
) {
  const resolvedOptions = {
    componentName: "default",
    loading: () => <></>,
    ...options,
  };

  class AsyncComponent extends React.Component<any, any> {
    constructor(props: React.JSX.Element) {
      super(props);

      this.state = {
        component: null,
      };
    }

    async componentDidMount() {
      const component = await importComponent();

      if (!component[resolvedOptions.componentName]) {
        console.error(
          `Exported function "${resolvedOptions.componentName}" does not exist for dynamic import: ${importComponent}`
        );
      }

      this.setState({
        component: component[resolvedOptions.componentName],
      });
    }

    render() {
      const C = this.state.component;

      return C ? <C {...this.props} /> : resolvedOptions.loading();
    }
  }

  return AsyncComponent;
}
