import { API } from "./api.ts";
import { InternalSlugManagerConfig, createManager } from "./manager.ts";

/**
 * The shape of the configuration options for the slug manager plugin.
 */
export type SlugManagerConfig = Omit<InternalSlugManagerConfig, "api"> & {
  apiKey: string;
  v?: string;
  env?: "production" | "sandbox";
}

/**
 * The createSlugManager function returns a configured object that contains
 * two functions that can be used to assist in managing slug fields.
 * The connector function is intended as a data source for a connector.
 * The webhook function is intended to be used as a webhook responding
 * to entity create and update events.
 *
 * @public
 */
export default function createSlugManager(config: SlugManagerConfig) {
  const api = new API(config.apiKey, {
    v: config.v,
    env: config.env,
  });

  return createManager(Object.assign(config, {api}))
}