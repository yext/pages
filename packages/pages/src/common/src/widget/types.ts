import React from "react";

/**
 * The type to include in any widget file. It defines the available functions and fields that are available
 * to the widget.
 *
 * @public
 */
export interface WidgetModule {
  /** The exported config function */
  config?: WidgetConfig;
  /**
   * The exported default widget function. This is expected to be a React Component.
   * If undefined then {@link render} will be used to generate the HTML instead.
   */
  default?: Widget;
}

/**
 * The type definition for the widget's default function.
 *
 * @public
 */
export type Widget = () => React.JSX.Element;

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
 * The shape of the data passed directly to the different widget functions.
 *
 * @public
 */
export interface WidgetProps {
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
  };
}
