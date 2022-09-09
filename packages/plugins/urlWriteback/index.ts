import { updateEntity } from "./yext.ts";

/**
 * The shape of the configuration options for the writeback plugin.
 */
export interface UrlWritebackConfig {
  field: string;
  apiKey: string;
  environment?: "sbx" | "prod";
  v?: string;
}

/**
 * The shape of the event triggered by the publishing system.
 */
interface WritebackPayload {
  url: string;
  entityId: string;
  feature: string;
  locale: string;
}

/**
 * The urlWriteback function returns a configured function that can be used
 * as a handler for the publishing system onUrlChange event in order to
 * save published urls back into the Knowledge Graph.
 *
 * @public
 */
export default function urlWriteback(config: UrlWritebackConfig) {
  function onUrlChange(event: WritebackPayload) {
    if (!(event.entityId && event.locale && event.url)) {
      return null;
    }

    const update = {
      [config.field]: event.url,
    };

    return updateEntity(event.entityId, event.locale, update, config.apiKey, {
      v: config.v,
      env: config.environment,
    });
  }

  return onUrlChange;
}
