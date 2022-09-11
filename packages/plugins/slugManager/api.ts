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
  slug?: string;
}

export interface Meta {
  id: string;
  language: string;
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
  savedSearchesIncludeEntity: (
    searchIds: string[],
    entityId: string
  ) => Promise<boolean>;
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
    }
  ) {
    const { v = "20220909", env = "production" } = config;
    this.apiKey = apiKey;
    this.v = v;
    this.baseUrl =
      env === "production"
        ? "https://api.yext.com/v2/accounts/me/"
        : "https://api-sandbox.yext.com/v2/accounts/me/";
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

  async savedSearchesIncludeEntity(searchIds: string[], entityId: string) {
    const params = new URLSearchParams({
      searchIds: searchIds.join(","),
      filter: JSON.stringify({ "meta.id": entityId }),
    });

    const req = new Request(this.constructRequestUrl("entities", params), {
      headers,
    });
    const resp = await wrappedFetch<ListEntitiesResponse<BaseEntity>>(req);
    return resp.count === 1;
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
