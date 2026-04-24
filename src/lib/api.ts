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
  /** Query string params */
  query?: Record<string, string | number | boolean | undefined | null>;
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

function buildUrl(path: string, query?: RequestOptions["query"]) {
  if (!query) return `${API_BASE_URL}${path}`;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ""}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, skipRefresh, headers, query, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData) && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!skipAuth) {
    const token = tokenStore.get();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path, query), {
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
  plan?: "free" | "pro" | "team";
  onboarded?: boolean;
  avatarUrl?: string;
};

export type UserProfile = {
  headline?: string;
  bio?: string;
  location?: string;
  currentRole?: string;
  experienceYears?: number;
  targetRole?: string;
  skills?: string[];
  goals?: string[];
};

export type FullUser = AuthUser & {
  _id?: string;
  profile?: UserProfile;
};

export type AuthResponse = { user: AuthUser; accessToken: string };

export type Conversation = {
  _id: string;
  title: string;
  messages?: { role: "user" | "assistant"; content: string; createdAt?: string }[];
  createdAt: string;
  updatedAt: string;
};

export type Resume = {
  _id: string;
  filename: string;
  status: "queued" | "processing" | "ready" | "failed";
  score?: number;
  breakdown?: {
    content?: number;
    structure?: number;
    keywords?: number;
    impact?: number;
    formatting?: number;
  };
  strengths?: string[];
  gaps?: string[];
  suggestions?: string[];
  error?: string;
  createdAt: string;
};

export type RoadmapItem = {
  _id: string;
  week: number;
  title: string;
  description?: string;
  category: "skill" | "project" | "networking" | "interview" | "other";
  resources?: { title: string; url: string }[];
  done: boolean;
  doneAt?: string;
};

export type Roadmap = {
  _id: string;
  targetRole: string;
  horizonWeeks: number;
  items: RoadmapItem[];
  progress: number;
  updatedAt: string;
};

export type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  level?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  tags?: string[];
  description?: string;
  applyUrl?: string;
  postedAt: string;
};

export type RecommendedJob = { job: Job; matchScore: number };

export type InterviewQuestion = {
  _id: string;
  type: "behavioral" | "technical" | "system-design" | "case";
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  rubric?: string[];
};

export type InterviewAnswer = {
  _id: string;
  question: InterviewQuestion | string;
  transcript: string;
  score: number;
  breakdown: { content: number; structure: number; delivery: number };
  feedback: string;
  suggestions?: string[];
  createdAt: string;
};

export type Notification = {
  _id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

/* ---------- Endpoint helpers ---------- */

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: input, skipAuth: true }),
  login: (input: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input, skipAuth: true }),
  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
  me: () => apiFetch<{ user: AuthUser }>("/auth/me"),
};

export const usersApi = {
  me: () => apiFetch<{ user: FullUser }>("/users/me"),
  update: (patch: { name?: string; profile?: UserProfile }) =>
    apiFetch<{ user: FullUser }>("/users/me", { method: "PATCH", body: patch }),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return apiFetch<{ user: FullUser }>("/users/me/avatar", { method: "POST", body: fd });
  },
};

export const onboardingApi = {
  submit: (input: {
    currentRole: string;
    experienceYears: number;
    targetRole: string;
    skills: string[];
    goals: string[];
  }) => apiFetch<{ user: FullUser }>("/onboarding", { method: "POST", body: input }),
};

export const chatApi = {
  listConversations: () =>
    apiFetch<{ items: Conversation[]; total: number }>("/chat/conversations"),
  getConversation: (id: string) =>
    apiFetch<{ conversation: Conversation }>(`/chat/conversations/${id}`),
  createConversation: () =>
    apiFetch<{ conversation: Conversation }>("/chat/conversations", { method: "POST" }),
  deleteConversation: (id: string) =>
    apiFetch<void>(`/chat/conversations/${id}`, { method: "DELETE" }),
  /** Streaming chat reply via SSE. Yields token deltas. */
  async *streamMessage(conversationId: string, content: string): AsyncGenerator<string> {
    const token = tokenStore.get();
    const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ content }),
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
        if (!payload) continue;
        try {
          const parsed = JSON.parse(payload) as {
            delta?: string;
            done?: boolean;
            error?: string;
          };
          if (parsed.error) throw new ApiError(parsed.error, 500, parsed);
          if (parsed.done) return;
          if (parsed.delta) yield parsed.delta;
        } catch (err) {
          if (err instanceof ApiError) throw err;
          // Unknown payload — skip
        }
      }
    }
  },
};

export const resumeApi = {
  list: () => apiFetch<{ items: Resume[] }>("/resume"),
  get: (id: string) => apiFetch<{ resume: Resume }>(`/resume/${id}`),
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("resume", file);
    return apiFetch<{ resume: Resume }>("/resume/upload", { method: "POST", body: fd });
  },
};

export const roadmapApi = {
  get: () => apiFetch<{ roadmap: Roadmap | null }>("/roadmap"),
  generate: () => apiFetch<{ roadmap: Roadmap }>("/roadmap/generate", { method: "POST" }),
  toggleItem: (itemId: string, done: boolean) =>
    apiFetch<{ roadmap: Roadmap }>(`/roadmap/items/${itemId}`, {
      method: "PATCH",
      body: { done },
    }),
};

export const jobsApi = {
  list: (params?: {
    q?: string;
    remote?: boolean;
    level?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }) =>
    apiFetch<{ items: Job[]; page: number; limit: number; total: number }>("/jobs", {
      query: params,
    }),
  recommended: () => apiFetch<{ items: RecommendedJob[] }>("/jobs/recommended"),
  get: (id: string) => apiFetch<{ job: Job }>(`/jobs/${id}`),
};

export const interviewApi = {
  questions: (params?: { type?: string; difficulty?: string }) =>
    apiFetch<{ items: InterviewQuestion[] }>("/interview/questions", { query: params }),
  submitAnswer: (input: { questionId: string; transcript: string }) =>
    apiFetch<{ answer: InterviewAnswer }>("/interview/answers", {
      method: "POST",
      body: input,
    }),
  answers: () => apiFetch<{ items: InterviewAnswer[] }>("/interview/answers"),
};

export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiFetch<{ items: Notification[]; total: number; unread: number }>("/notifications", {
      query: params,
    }),
  markRead: (id: string) =>
    apiFetch<{ ok: true }>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch<{ ok: true }>("/notifications/read-all", { method: "PATCH" }),
};

export const billingApi = {
  checkout: (plan: "pro" | "team" = "pro") =>
    apiFetch<{ url: string }>("/billing/checkout", { method: "POST", body: { plan } }),
  portal: () => apiFetch<{ url: string }>("/billing/portal", { method: "POST" }),
};
