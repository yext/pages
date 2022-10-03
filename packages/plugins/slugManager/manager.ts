import { IAPI, BaseEntity, Meta } from "./api.ts";
interface ProfileUpdate {
  meta: Meta;
  isAlternateProfile: boolean;
  [key: string]: string | boolean | Meta;
}

export interface InternalSlugManagerConfig {
  slugFormat: string;
  searchIds?: string[];
  entityTypes?: string[];
  slugField?: string;
  slugFormatLocaleOverrides?: Record<string, string>;
  api: Pick<
    IAPI,
    | "savedSearchesIncludeEntity"
    | "updateField"
    | "listLanguageProfiles"
    | "listEntities"
  >;
}

export function createManager(config: InternalSlugManagerConfig) {
  const {
    slugFormatLocaleOverrides = {},
    searchIds = [],
    slugField = "slug",
    entityTypes = [],
    slugFormat,
    api,
  } = config;

  async function connector(inputString: string | undefined) {
    const input = JSON.parse(inputString || "{}");
    const pageToken = input.pageToken || "";

    const params = new URLSearchParams({
      fields: "meta",
    });
    if (pageToken) {
      params.set("pageToken", pageToken);
    }
    if (searchIds.length) {
      params.set("searchIds", searchIds.join(","));
    }
    if (entityTypes.length) {
      params.set("entityTypes", entityTypes.join(","));
    }
    const entitiesResponse = await api.listEntities(params);

    const profileParams = new URLSearchParams({
      fields: ["meta", slugField].join(","),
      filter: JSON.stringify({
        "meta.id": {
          $in: entitiesResponse.entities.map((entity) => entity.meta.id),
        },
      }),
    });
    const response = await api.listLanguageProfiles(profileParams);

    const idToPrimaryLanguage = getEntityIdToPrimaryLanguageMap(
      entitiesResponse.entities
    );
    const updates = getUpdates(
      response.profileLists.flatMap((profile) => profile.profiles),
      idToPrimaryLanguage,
      slugField,
      slugFormat,
      slugFormatLocaleOverrides
    );

    const outputString = JSON.stringify({
      data: updates,
      nextPageToken: entitiesResponse.pageToken,
    });

    return outputString;
  }

  async function webhook(event: WebhookEvent) {
    if (!(isEntityCreate(event) || isLangProfileCreate(event))) return;

    if (entityTypes.length) {
      if (!entityTypes.includes(event.primaryProfile.meta.entityType)) return;
    }

    if (searchIds.length) {
      if (!(await api.savedSearchesIncludeEntity(searchIds, event.entityId))) {
        return null;
      }
    }

    const lang = event.changedFields.language;
    const slug =
      lang in slugFormatLocaleOverrides
        ? slugFormatLocaleOverrides[lang]
        : slugFormat;

    return api.updateField(event.entityId, lang, slugField, slug);
  }

  return { connector, webhook };
}

export function getUpdates(
  profiles: BaseEntity[],
  idToPrimaryLanguage: Record<string, string>,
  slugField: string,
  slugFormat: string,
  slugFormatLocaleOverrides: Record<string, string>
) {
  const updates: ProfileUpdate[] = [];
  for (const profile of profiles) {
    const lang = profile.meta.language;
    const desiredSlug =
      lang in slugFormatLocaleOverrides
        ? slugFormatLocaleOverrides[lang]
        : slugFormat;

    updates.push({
      [slugField]: desiredSlug,
      isAlternateProfile:
        profile.meta.language !== idToPrimaryLanguage[profile.meta.id],
      meta: {
        id: profile.meta.id,
        language: profile.meta.language,
      },
    });
  }

  return updates;
}

function getEntityIdToPrimaryLanguageMap(entities: BaseEntity[]) {
  return entities.reduce((map: Record<string, string>, entity) => {
    map[entity.meta.id] = entity.meta.language;
    return map;
  }, {});
}

function isEntityCreate(event: WebhookEvent) {
  return event.meta.eventType === "ENTITY_CREATED";
}

function isLangProfileCreate(event: WebhookEvent) {
  return (
    event.meta.eventType === "ENTITY_UPDATED" &&
    event.changedFields?.fieldNames?.length > 0 &&
    event.changedFields.fieldNames.includes("meta.language")
  );
}

interface WebhookEvent {
  entityId: string;
  meta: { eventType: string };
  languageProfiles: BaseEntity[];
  primaryProfile: BaseEntity;
  changedFields: { language: string; fieldNames: string[] };
}
