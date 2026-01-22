import {
  assertEquals,
  assertExists,
  assertNotEquals,
} from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { createManager, getUpdates } from "./manager.ts";
import { BaseEntity, IAPI } from "./api.ts";

const profiles = [
  {
    name: "1",
    meta: {
      id: "1",
      language: "en",
      entityType: "location",
    },
    c_customField: "customValue",
  },
  {
    name: "1",
    meta: {
      id: "1",
      language: "fr",
      entityType: "location",
    },
    c_customField: "customValue",
  },
  {
    name: "2",
    meta: {
      id: "2",
      language: "en",
      entityType: "location",
    },
    c_customField: "",
  },
];

const idToPrimaryLanguage: Record<string, string> = {
  "1": "es-US",
  "2": "en",
};
const slugField = "c_slug";
const slugFormatString = "[[localeCode]]/[[address.line1]]/hardcodedPath";
const slugFormatFunc = (lang: string, profile: BaseEntity) => {
  const { c_customField } = profile;
  if (c_customField) {
    return `[[localeCode]]/[[address.line1]]/${c_customField}`;
  }

  return `[[localeCode]]/[[address.line1]]/hardcodedPath`;
};
const slugFormatFuncFields = ["c_customField"];

Deno.test("getUpdates returns correct number of updates", () => {
  const updates = getUpdates(profiles, idToPrimaryLanguage, slugField, slugFormatString);

  assertEquals(updates.length, 3);
});

Deno.test("getUpdates correctly sets isAlternateProfile", () => {
  const updates = getUpdates(profiles, idToPrimaryLanguage, slugField, slugFormatString);

  for (const update of updates) {
    assertNotEquals(
      update.isAlternateProfile,
      idToPrimaryLanguage[update.meta.id] === update.meta.language
    );
  }
});

Deno.test("getUpdates sets correct slug field", () => {
  const updates = getUpdates(profiles, idToPrimaryLanguage, slugField, slugFormatString);

  updates.forEach((update) => assertExists(update[slugField]));
});

Deno.test("getUpdates respects slug format", () => {
  const updates = getUpdates(profiles, idToPrimaryLanguage, slugField, slugFormatFunc);

  updates.forEach((update, idx) => {
    const expectedSlug = slugFormatFunc(update.meta.language, profiles[idx]);
    assertEquals(update[slugField], expectedSlug);
  });
});

const baseMockAPI: IAPI = {
  updateField: <T>(id: string, locale: string, field: string, value: string) => {
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
      savedFilters: ["not-search-id"],
    },
    changedFields: { language: "en", fieldNames: ["savedFilters"] },
  });

  assertEquals(updateFieldWasCalled, false);
});

Deno.test("webhook skips updates for non-relevant fields", () => {
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
    meta: { eventType: "ENTITY_UPDATES" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "location" },
      name: "name",
      c_non_relavent_field: "value",
    },
    changedFields: { language: "en", fieldNames: ["c_non_relavent_field"] },
  });

  assertEquals(updateFieldWasCalled, false);
});

Deno.test("webhook makes update when entityType is correct", () => {
  let updateFieldWasCalled = false;
  const mockApi: IAPI = Object.assign({}, baseMockAPI, {
    updateField: (id: string, locale: string, field: string, value: string) => {
      updateFieldWasCalled = true;
      return baseMockAPI.updateField(id, locale, field, value);
    },
  });

  const { webhook } = createManager({
    slugFormat: "[[embedded]]/hardcodedPath",
    entityTypes: ["hotel", "restaurant"],
    api: mockApi,
  });

  webhook({
    entityId: "",
    meta: { eventType: "ENTITY_CREATED" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "hotel" },
      name: "name",
    },
    changedFields: { language: "en", fieldNames: [] },
  });

  assertEquals(updateFieldWasCalled, true);
});

Deno.test("webhook makes update when savedFilters is correct", () => {
  let updateFieldWasCalled = false;
  const mockApi: IAPI = Object.assign({}, baseMockAPI, {
    updateField: (id: string, locale: string, field: string, value: string) => {
      updateFieldWasCalled = true;
      return baseMockAPI.updateField(id, locale, field, value);
    },
  });

  const { webhook } = createManager({
    slugFormat: "[[embedded]]/hardcodedPath",
    searchIds: ["id-1", "id-2", "id-3"],
    api: mockApi,
  });

  webhook({
    entityId: "",
    meta: { eventType: "ENTITY_CREATED" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "hotel" },
      name: "name",
      savedFilters: ["id-2"],
    },
    changedFields: { language: "en", fieldNames: ["savedFilters"] },
  });

  assertEquals(updateFieldWasCalled, true);
});

Deno.test("webhook makes update for relavent fields", () => {
  let updateFieldWasCalled = false;
  const mockApi: IAPI = Object.assign({}, baseMockAPI, {
    updateField: (id: string, locale: string, field: string, value: string) => {
      updateFieldWasCalled = true;
      return baseMockAPI.updateField(id, locale, field, value);
    },
  });

  const { webhook } = createManager({
    slugFormat: slugFormatFunc,
    fields: slugFormatFuncFields,
    api: mockApi,
  });

  webhook({
    entityId: "",
    meta: { eventType: "ENTITY_CREATED" },
    languageProfiles: [],
    primaryProfile: {
      meta: { id: "id", language: "en", entityType: "location" },
      name: "name",
      c_customField: "newCustomValue",
    },
    changedFields: { language: "en", fieldNames: ["c_customField"] },
  });

  assertEquals(updateFieldWasCalled, true);
});
