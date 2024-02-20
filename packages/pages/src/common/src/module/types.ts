import React from "react";

/**
 * The type definition for the module's default function.
 *
 * @public
 */
export type Module = () => React.JSX.Element;

/**
 * The exported `config` function's definition.
 *
 * @public
 */
export interface ModuleConfig {
  /** The name of the module feature. If not defined uses the module filename (without extension) */
  name?: string;
}

/**
 * The shape of the data passed directly to the different module functions.
 *
 * @public
 */
export interface ModuleProps {
  /** Additional metadata added by the toolchain */
  __meta: {
    /** Specifies if the data is returned in development or production mode */
    mode: "development" | "production";
  };
}
