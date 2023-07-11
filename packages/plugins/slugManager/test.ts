import {
  assertEquals,
  assertExists,
  assertNotEquals,
} from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { createManager, getUpdates } from "./manager.ts";
import { IAPI } from "./api.ts";

const profiles = [
  {
    name: "1",
    meta: {
      id: "1",
      language: "en",
      entityType: "location",
    },
  },
  {
    name: "1",
    meta: {
      id: "1",
      language: "es-US",
      entityType: "location",
    },
  },
  {
    name: "2",
    meta: {
      id: "2",
      language: "en",
      entityType: "location",
    },
  },
];

const idToPrimaryLanguage: Record<string, string> = {
  "1": "es-US",
  "2": "en",
};
const slugField = "c_slug";
const slugFormat = "[[localeCode]]/[[address.line1]]/hardcodedPath";
const slugFormatLocaleOverrides: Record<string, string> = {
  en: "[[localeCode]]/[[address.line1]]/hardcodedPath",
};

Deno.test("getUpdates returns correct number of updates", () => {
  const updates = getUpdates(
    profiles,
    idToPrimaryLanguage,
    slugField,
    slugFormat,
    slugFormatLocaleOverrides
  );

  assertEquals(updates.length, 3);
});

Deno.test("getUpdates correctly sets isAlternateProfile", () => {
  const updates = getUpdates(
    profiles,
    idToPrimaryLanguage,
    slugField,
    slugFormat,
    slugFormatLocaleOverrides
  );

  for (const update of updates) {
    assertNotEquals(
      update.isAlternateProfile,
      idToPrimaryLanguage[update.meta.id] === update.meta.language
    );
  }
});

Deno.test("getUpdates sets correct slug field", () => {
  const updates = getUpdates(
    profiles,
    idToPrimaryLanguage,
    slugField,
    slugFormat,
    slugFormatLocaleOverrides
  );

  updates.forEach((update) => assertExists(update[slugField]));
});

Deno.test("getUpdates respects slug format", () => {
  const updates = getUpdates(
    profiles,
    idToPrimaryLanguage,
    slugField,
    slugFormat,
    slugFormatLocaleOverrides
  );

  updates.forEach((update) => {
    const expectedSlug =
      slugFormatLocaleOverrides[update.meta.language] || slugFormat;
    assertEquals(update[slugField], expectedSlug);
  });
});

const baseMockAPI: IAPI = {
  savedSearchesIncludeEntity: () => Promise.resolve(true),
  updateField: <T>(
    id: string,
    locale: string,
    field: string,
    value: string
  ) => {
    return Promise.resolve({
      name: id,
      [field]: value,
      meta: {
        id: id,
        language: locale,
      },
    } as unknown as T);
  },
  listLanguageProfiles: () => {
    return Promise.resolve({ profileLists: [], count: 0 });
  },
  listEntities: () => {
    return Promise.resolve({ entities: [], count: 0 });
  },
};

Deno.test("webhook skips events with incorrect type", () => {
  let updateFieldWasCalled = false;
  const mockApi: IAPI = Object.assign({}, baseMockAPI, {
    updateField: (id: string, locale: string, field: string, value: string) => {
      updateFieldWasCalled = true;
      return baseMockAPI.updateField(id, locale, field, value);
    },
  });

  const { webhook } = createManager({
    slugFormat: "[[embedded]]/hardcodedPath",
    api: mockApi,
  });

  webhook({
    entityId: "",
    meta: { eventType: "BAD_EVENT_TYPE" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "location" },
      name: "name",
    },
    changedFields: { language: "en", fieldNames: [] },
  });

  assertEquals(updateFieldWasCalled, false);
});

Deno.test("webhook skips entities with incorrect type", () => {
  let updateFieldWasCalled = false;
  const mockApi: IAPI = Object.assign({}, baseMockAPI, {
    updateField: (id: string, locale: string, field: string, value: string) => {
      updateFieldWasCalled = true;
      return baseMockAPI.updateField(id, locale, field, value);
    },
  });

  const { webhook } = createManager({
    slugFormat: "[[embedded]]/hardcodedPath",
    entityTypes: ["location"],
    api: mockApi,
  });

  webhook({
    entityId: "",
    meta: { eventType: "ENTITY_CREATED" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "not a location" },
      name: "name",
    },
    changedFields: { language: "en", fieldNames: [] },
  });

  assertEquals(updateFieldWasCalled, false);
});

Deno.test("webhook skips entities outside of saved search", () => {
  let updateFieldWasCalled = false;
  const mockApi: IAPI = Object.assign({}, baseMockAPI, {
    savedSearchesIncludeEntity: () => {
      return false;
    },
    updateField: (id: string, locale: string, field: string, value: string) => {
      updateFieldWasCalled = true;
      return baseMockAPI.updateField(id, locale, field, value);
    },
  });

  const { webhook } = createManager({
    searchIds: ["search-id"],
    slugFormat: "[[embedded]]/hardcodedPath",
    api: mockApi,
  });

  webhook({
    entityId: "",
    meta: { eventType: "ENTITY_CREATED" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "location" },
      name: "name",
    },
    changedFields: { language: "en", fieldNames: [] },
  });

  assertEquals(updateFieldWasCalled, false);
});

Deno.test("webhook makes update when appropriate", () => {
  let updateFieldWasCalled = false;
  const mockApi: IAPI = Object.assign({}, baseMockAPI, {
    updateField: (id: string, locale: string, field: string, value: string) => {
      updateFieldWasCalled = true;
      return baseMockAPI.updateField(id, locale, field, value);
    },
  });

  const { webhook } = createManager({
    slugFormat: "[[embedded]]/hardcodedPath",
    api: mockApi,
  });

  webhook({
    entityId: "",
    meta: { eventType: "ENTITY_CREATED" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "location" },
      name: "name",
    },
    changedFields: { language: "en", fieldNames: [] },
  });

  assertEquals(updateFieldWasCalled, true);
});
