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
  locale: string;
}

export function urlWritebackPlugin(config: UrlWritebackConfig) {
  function onUrlChange(event: WritebackPayload) {
    if (!(event.entityId && event.locale)) { return null }

    const update = {
      [config.field]: event.url,
    }

    return updateEntity(event.entityId, update, config.apiKey, {
      v: config.v,
      env: config.environment
    })
  }

  return onUrlChange;
}