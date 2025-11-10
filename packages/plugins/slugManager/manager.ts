import { IAPI, BaseEntity, Meta, API } from "./api.ts";

interface ProfileUpdate {
  meta: Meta;
  isAlternateProfile: boolean;
  [key: string]: string | boolean | Meta;
}

interface SlugFormatString {
  slugFormat: string;
  fields?: never;
}

interface SlugConflictFormatString {
  slugConflictFormat?: string;
  fields?: never;
}

interface SlugFormatFunc {
  slugFormat: (lang: string, profile: BaseEntity) => string;
  fields: string[];
}

interface SlugConflictFormatFunc {
  slugConflictFormat?: (lang: string, profile: BaseEntity) => string;
  fields?: string[];
}

export type InternalSlugManagerConfig = {
  searchIds?: string[];
  entityTypes?: string[];
  slugField?: string;
  api: Pick<IAPI, "updateField" | "listLanguageProfiles" | "listEntities">;
} & (SlugFormatString | SlugFormatFunc) & (SlugConflictFormatString | SlugConflictFormatFunc);

export function createManager(config: InternalSlugManagerConfig) {
  const {
    searchIds = [],
    slugField = "slug",
    entityTypes = [],
    slugFormat,
    slugConflictFormat = undefined,
    api,
    fields,
  } = config;

  const slugGeneratorFnFields = fields || [];

  async function connector(inputString: string | undefined) {
    const input = JSON.parse(inputString || "{}");
    const pageToken = input.pageToken || "";

    const params = new URLSearchParams({
      fields: ["meta", ...slugGeneratorFnFields].join(","),
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

    if (!entitiesResponse?.entities?.length) {
      return JSON.stringify({
        data: [],
      });
    }

    const profileParams = new URLSearchParams({
      fields: ["meta", ...slugGeneratorFnFields].join(","),
      filter: JSON.stringify({
        "meta.id": {
          $in: entitiesResponse.entities.map((entity) => entity.meta.id),
        },
      }),
      rendered: "true",
    });
    const response = await api.listLanguageProfiles(profileParams);

    const idToPrimaryLanguage = getEntityIdToPrimaryLanguageMap(
      entitiesResponse.entities
    );
    const updates = await getUpdates(
      response.profileLists.flatMap((profile) => profile.profiles),
      idToPrimaryLanguage,
      slugField,
      slugFormat,
      api,
      slugConflictFormat
    );

    const outputString = JSON.stringify({
      data: updates,
      nextPageToken: entitiesResponse.pageToken,
    });

    return outputString;
  }

  async function webhook(event: WebhookEvent) {
    if (!(isEntityCreate(event) || isFieldUpdate(event, slugGeneratorFnFields)))
      return;

    if (entityTypes.length) {
      if (!entityTypes.includes(event.primaryProfile.meta.entityType)) return;
    }

    if (searchIds.length) {
      if (
        !(event.primaryProfile.savedFilters || []).some((filter) =>
          searchIds.includes(filter)
        )
      )
        return;
    }

    const lang = event.changedFields.language;
    const profile =
      lang == event.primaryProfile.meta.language
        ? event.primaryProfile
        : event.languageProfiles.find(
            (profile) => profile.meta.language == lang
          );

    if (!profile) {
      throw new Error(
        `Could not find profile for language ${lang} for entity ${event.entityId}`
      );
    }

    let desiredSlug =
      typeof slugFormat == "string" ? slugFormat : slugFormat(lang, profile);
    const isDuplicate = await isSlugConfict(desiredSlug, api);
    if (isDuplicate) {
      desiredSlug = slugConflictFormat == null ? desiredSlug + "-[[entityId]]" : typeof slugConflictFormat == "string" ? slugConflictFormat : slugConflictFormat(lang, profile);
    }
    return api.updateField(event.entityId, lang, slugField, desiredSlug);
  }

  return { connector, webhook };
}

async function isSlugConfict(desiredSlug : string, api : Pick<IAPI, "updateField" | "listLanguageProfiles" | "listEntities">) {
  const params = new URLSearchParams({
    fields: ["meta", ...["slug"]].join(","),
    /**
     * Match entities that have the same slug.
     */
    filter: JSON.stringify({
      "slug": {
        $contains: desiredSlug,
      }
    }),
  });
  const entitiesResponse = await api.listEntities(params);	
  if (entitiesResponse?.entities?.length > 1) {
    return true;
  }
  return false;
}

export async function getUpdates(
  profiles: BaseEntity[],
  idToPrimaryLanguage: Record<string, string>,
  slugField: string,
  slugFormat: string | ((lang: string, profile: BaseEntity) => string),
  api: Pick<IAPI, "updateField" | "listLanguageProfiles" | "listEntities">,
  slugConflictFormat?: string | ((lang: string, profile: BaseEntity) => string)
) {
  const updates: ProfileUpdate[] = [];
  for (const profile of profiles) {
    const lang = profile.meta.language;
    let desiredSlug =
      typeof slugFormat == "string" ? slugFormat : slugFormat(lang, profile);
    const isDuplicate = await isSlugConfict(desiredSlug, api);
    if (isDuplicate) {
      desiredSlug = slugConflictFormat == null ? desiredSlug + "-[[entityId]]" : typeof slugConflictFormat == "string" ? slugConflictFormat : slugConflictFormat(lang, profile);
    }

    updates.push({
      [slugField]: desiredSlug,
      isAlternateProfile:
        profile.meta.language !== idToPrimaryLanguage[profile.meta.id],
      meta: {
        id: profile.meta.id,
        language: profile.meta.language,
        entityType: profile.meta.entityType,
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

function isFieldUpdate(event: WebhookEvent, slugGeneratorFnFields: string[]) {
  const targetFields = [
    ...slugGeneratorFnFields,
    "meta.language",
    "savedFilters",
  ];
  return (
    event.meta.eventType === "ENTITY_UPDATED" &&
    event.changedFields?.fieldNames?.length > 0 &&
    event.changedFields.fieldNames.some((field) => targetFields.includes(field))
  );
}

interface WebhookEvent {
  entityId: string;
  meta: { eventType: string };
  languageProfiles: BaseEntity[];
  primaryProfile: BaseEntity;
  changedFields: { language: string; fieldNames: string[] };
}
