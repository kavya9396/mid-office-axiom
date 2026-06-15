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
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data as TResponse;
};