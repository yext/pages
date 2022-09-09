interface EntityProfile {
  [field: string]: ProfileValue;

  meta?: {
    accountId: string;
    uid: string;
    id: string;
    timestamp: string;
    folderId: string;
    language: string;
    countryCode: string;
    entityType: string;
  };

  name?: string;
}

type ProfileValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ProfileValue[]
  | { [k: string]: ProfileValue };

interface ApiResponse<T> {
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

const API_BASE_PROD = "https://api.yext.com/v2/accounts/me/";
const API_BASE_SBX = "https://api-sandbox.yext.com/v2/accounts/me/";

export function buildApiUrl(
  base: string,
  path: string,
  params?: Record<string, string>
) {
  const result = new URL(path, base);
  for (const k in params) {
    result.searchParams.append(k, params[k]);
  }
  return result.toString();
}

// TODO: when the official typescript API client has more
// functionality, switch to using that: https://github.com/yext/yext-api-ts
export async function updateEntity<T extends EntityProfile>(
  id: string,
  locale: string,
  body: EntityProfile,
  apiKey: string,
  options?: {
    env?: "prod" | "sbx";
    v?: string;
  }
): Promise<T> {
  const URL_BASE = options?.env === "sbx" ? API_BASE_SBX : API_BASE_PROD;

  const url = buildApiUrl(URL_BASE, `entityprofiles/${id}/${locale}`, {
    api_key: apiKey,
    v: options?.v || "20220903",
  });
  const req = new Request(url, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
  const response = await fetch(req);
  if (response.status < 200 || response.status >= 300) {
    const responseBody = (await response.json()) as ApiResponse<T>;
    throw responseBody.meta.errors[0].message;
  }
  const responseBody = (await response.json()) as ApiResponse<T>;
  return responseBody.response;
}
