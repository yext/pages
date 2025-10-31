import { resolveApiBase } from "../apiUtils.ts";

export interface ApiResponse<T = Record<string, unknown>> {
  meta: {
    uuid: string;
    errors: {
      code: number;
      message: string;
      type: string;
    }[];
  };
  response: T;
}

export interface BaseEntity {
  meta: {
    id: string;
    language: string;
    entityType: string;
  };
  name: string;
  savedFilters?: string[];
  [key: string]: any;
}

export interface Meta {
  id: string;
  language: string;
  entityType?: string;
}

async function wrappedFetch<T>(req: Request) {
  const response = await fetch(req);
  if (response.status < 200 || response.status >= 300) {
    const responseBody = (await response.json()) as ApiResponse<T>;
    throw responseBody.meta.errors[0].message;
  }
  const responseBody = (await response.json()) as ApiResponse<T>;
  return responseBody.response;
}

export interface ListEntitiesResponse<EntityType> {
  entities: EntityType[];
  count: number;
  pageToken?: string;
}

export interface ListLanguageProfilesResponse<EntityType> {
  profileLists: {
    profiles: EntityType[];
  }[];
  count: number;
  pageToken?: string;
}

export interface IAPI {
  updateField: <EntityType = BaseEntity>(
    id: string,
    locale: string,
    field: string,
    value: string
  ) => Promise<EntityType>;
  listLanguageProfiles: <EntityType = BaseEntity>(
    params?: URLSearchParams
  ) => Promise<ListLanguageProfilesResponse<EntityType>>;
  listEntities: <EntityType = BaseEntity>(
    params?: URLSearchParams
  ) => Promise<ListEntitiesResponse<EntityType>>;
}

const headers = { "Content-Type": "application/json; charset=utf-8" };

export class API implements IAPI {
  baseUrl: string;
  apiKey: string;
  v: string;
  constructor(
    apiKey: string,
    config: {
      v?: string;
      env?: "sandbox" | "production";
      partition?: "US" | "EU";
    }
  ) {
    const { v = "20220909", env = "production", partition = "US" } = config;
    this.apiKey = apiKey;
    this.v = v;
    this.baseUrl = resolveApiBase(partition, env);
  }

  constructRequestUrl(path: string, additionalParams?: URLSearchParams) {
    const params = new URLSearchParams({
      v: this.v,
      api_key: this.apiKey,
    });
    if (additionalParams) {
      for (const [key, val] of additionalParams.entries()) {
        params.set(key, val);
      }
    }

    return `${this.baseUrl}${path}?${params.toString()}`;
  }

  async updateField<EntityType = BaseEntity>(
    id: string,
    locale: string,
    field: string,
    value: string
  ) {
    const url = this.constructRequestUrl(`entityprofiles/${id}/${locale}`);
    const req = new Request(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        [field]: value,
      }),
    });

    return await wrappedFetch<EntityType>(req);
  }

  async listEntities<EntityType = BaseEntity>(
    additionalParams?: URLSearchParams
  ) {
    const url = this.constructRequestUrl(`entities`, additionalParams);
    const req = new Request(url, { headers });

    return await wrappedFetch<ListEntitiesResponse<EntityType>>(req);
  }

  async listLanguageProfiles<T = BaseEntity>(
    additionalParams?: URLSearchParams
  ) {
    const url = this.constructRequestUrl("entityprofiles", additionalParams);
    const req = new Request(url, { headers });

    return await wrappedFetch<ListLanguageProfilesResponse<T>>(req);
  }
}
