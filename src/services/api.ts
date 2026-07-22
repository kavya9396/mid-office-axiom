// services/api.ts

export interface ApiRequest<TRequest = unknown> {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TRequest;
}

export const apiRequest = async <TResponse = unknown, TRequest = unknown>({
  url,
  method,
  body,
}: ApiRequest<TRequest>): Promise<TResponse> => {
  const isMockJsonRequest = url.endsWith(".json");
  const resolvedMethod = isMockJsonRequest ? "GET" : method;

  const response = await fetch(url, {
    method: resolvedMethod,
    headers: {
      "Content-Type": "application/json",
    },
    body: resolvedMethod !== "GET" && body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data as TResponse;
};