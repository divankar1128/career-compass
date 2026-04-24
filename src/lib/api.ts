/**
 * API client for the Ascend backend (Express + MongoDB).
 *
 * Configure the base URL via VITE_API_URL.
 * Defaults to http://localhost:4000/api/v1 for local development.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000/api/v1";

const ACCESS_TOKEN_KEY = "ascend.accessToken";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip Authorization header even if a token is stored */
  skipAuth?: boolean;
  /** Skip automatic refresh-on-401 retry */
  skipRefresh?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken?: string };
      if (data.accessToken) {
        tokenStore.set(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, skipRefresh, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData) && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = tokenStore.get();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  if (res.status === 401 && !skipAuth && !skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    }
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (typeof data === "object" && data && "message" in data
        ? String((data as { message: unknown }).message)
        : null) || `Request failed: ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

/* ---------- Domain types ---------- */

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "pro" | "admin";
  plan?: string;
  onboarded?: boolean;
  avatarUrl?: string;
};

export type AuthResponse = { user: AuthUser; accessToken: string };

/* ---------- Endpoint helpers ---------- */

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: input, skipAuth: true }),
  login: (input: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input, skipAuth: true }),
  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
  me: () => apiFetch<{ user: AuthUser }>("/auth/me"),
};

export const chatApi = {
  /** Streaming chat via SSE. Returns an async iterator of token chunks. */
  async *stream(message: string, conversationId?: string): AsyncGenerator<string> {
    const token = tokenStore.get();
    const res = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ message, conversationId }),
    });
    if (!res.ok || !res.body) {
      throw new ApiError(`Chat stream failed: ${res.status}`, res.status, null);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload) as { delta?: string; content?: string };
          const chunk = parsed.delta ?? parsed.content ?? "";
          if (chunk) yield chunk;
        } catch {
          yield payload;
        }
      }
    }
  },
};
