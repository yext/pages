import { updateEntity } from "./yext.ts";

interface UrlWritebackConfig {
  field: string
  apiKey: string
  environment?: "sbx" | "prod"
  v?: string
}

export interface WritebackPayload {
  url: string;
  entityId: string;
  feature: string;
  locale: string;
}

export default function urlWritebackPlugin(config: UrlWritebackConfig) {
  function onUrlChange(event: WritebackPayload) {
    if (!(event.entityId && event.locale && event.url)) { return null }

    const update = {
      [config.field]: event.url,
    }

    return updateEntity(event.entityId, event.locale, update, config.apiKey, {
      v: config.v,
      env: config.environment
    })
  }

  return onUrlChange;
}