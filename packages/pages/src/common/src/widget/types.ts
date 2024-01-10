import React from "react";

/**
 * The type to include in any widget file. It defines the available functions and fields that are available
 * to the template.
 *
 * @public
 */
export interface WidgetModule<U extends WidgetRenderProps> {
  /** The exported config function */
  config?: WidgetConfig;
  /**
   * The exported default widget function. This is expected to be a React Component.
   * If undefined then {@link render} will be used to generate the HTML instead.
   */
  default?: Widget<U>;
}

/**
 * The type definition for the widget's default function.
 *
 * @public
 */
export type Widget<T extends WidgetRenderProps> = (
  props: T
) => React.JSX.Element;

/**
 * The exported `config` function's definition.
 *
 * @public
 */
export interface WidgetConfig {
  /** The name of the widget feature. If not defined uses the widget filename (without extension) */
  name?: string;
}

/**
 * The shape of the data passed directly to the different template functions
 *
 * @public
 */
export interface WidgetProps<T = Record<string, any>> {
  /** The entire document returned after applying the stream to a single entity */
  document: T;
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
  };
}

/**
 * The shape of the data passed directly to the template's render function.
 * Extends the {@link TemplateProps} interface and has the additions of a path
 * and a relativePrefixToRoot field.
 *
 * @public
 */
export interface WidgetRenderProps<T = any> extends WidgetProps<T> {
  /**
   * The path that the generated file will live at on the site, as defined
   * by the {@link GetPath} function.
   */
  path: string;
  /**
   * The relative path from the generated page to the root of the site.
   * i.e. The path example/path/foo would have the relativePrefixToRoot
   * of '../../'.
   */
  relativePrefixToRoot: string;
}
