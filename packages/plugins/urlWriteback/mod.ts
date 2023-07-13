import { updateEntity } from "./yext.ts";

/**
 * The shape of the configuration options for the writeback plugin.
 *
 * The featureToFieldMap is an optional property that can be used to define
 * a custom field to store a page's URL for other features that are powered by entity data
 * i.e., custom review forms that are powered by entity data but have a different
 * CF to store the prod URL of the page.
 */
export interface UrlWritebackConfig {
  field: string;
  apiKey: string;
  environment?: "sbx" | "prod";
  v?: string;
  featureToFieldMap?: Record<string, string>;
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

    let field = config.field;

    if (config.featureToFieldMap && config.featureToFieldMap[event.feature]) {
      field = config.featureToFieldMap[event.feature];
    }

    const update = {
      [field]: `https://${event.url}`,
    };

    return updateEntity(event.entityId, event.locale, update, config.apiKey, {
      v: config.v,
      env: config.environment,
    });
  }

  return onUrlChange;
}
