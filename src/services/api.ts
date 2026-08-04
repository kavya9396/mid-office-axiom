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
  const resolvedUrl = isMockJsonRequest
    ? `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`
    : url;
  const resolvedMethod = isMockJsonRequest ? "GET" : method;

  const response = await fetch(resolvedUrl, {
    method: resolvedMethod,
    cache: isMockJsonRequest ? "no-store" : "default",
    headers: {
      "Content-Type": "application/json",
    },
    body: resolvedMethod !== "GET" && body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData && typeof errorData === "object" && !Array.isArray(errorData)) {
        const record = errorData as Record<string, unknown>;
        const apiMessage = String(record.message ?? "").trim();
        if (apiMessage) {
          errorMessage = apiMessage;
        }
      }
    } catch {
      // Ignore parse failures and keep the status-based fallback message.
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as TResponse;
};