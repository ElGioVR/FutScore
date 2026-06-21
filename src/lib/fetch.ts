export interface FetchOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  cache?: RequestCache;
  retries?: number;
  retryDelay?: (attempt: number) => number;
}

export async function fetchJson<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeoutMs = 16000,
    headers = {},
    cache = "no-cache",
    retries = 0,
    retryDelay = (attempt) => attempt * 650,
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          accept: "application/json",
          "user-agent": "FutScore/1.0",
          ...headers,
        },
        cache,
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`${url} returned ${response.status}`);
      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error;
      clearTimeout(timeout);

      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt)));
      }
    }
  }

  throw lastError;
}