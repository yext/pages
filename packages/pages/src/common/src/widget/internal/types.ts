import { WidgetConfig } from "../../widget/types.js";

/**
 * The exported `config` function's definition.
 */
export interface WidgetConfigInternal {
  /** The name of the widget feature. If not defined uses the widget filename (without extension) */
  name: string;
}

export const convertWidgetConfigToWidgetConfigInternal = (
  widgetName: string,
  widgetConfig: WidgetConfig | undefined
): WidgetConfigInternal => {
  return {
    name: widgetConfig?.name ?? widgetName,
  };
};
