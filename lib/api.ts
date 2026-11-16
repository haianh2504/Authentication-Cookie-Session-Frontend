export type ApiEnvelope<T> = {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  data: T;
};

export type GalleryImage = { imageId: string; imageURL: string };
export type GalleryPage = {
  items: GalleryImage[];
  pagination: { limit: number; nextCursor: string | null; hasNextPage: boolean };
};
export type AuthState = { authenticated: boolean };
export type UploadedImage = { imageId: string; imageURL: string };
export type DeletedImage = { deleted: boolean; imageId: string };

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const item = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

async function responseData<T>(response: Response): Promise<T> {
  let payload: Partial<ApiEnvelope<T>> & { data?: T };
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("Máy chủ trả về phản hồi không đọc được. Vui lòng thử lại.", response.status);
  }
  if (!response.ok) {
    const errors = (payload.data as { errors?: Array<{ message?: string }> } | undefined)?.errors;
    throw new ApiError(errors?.[0]?.message || payload.message || "Có lỗi xảy ra. Vui lòng thử lại.", response.status, payload.code);
  }
  if (payload.data === undefined) throw new ApiError("Phản hồi từ máy chủ thiếu dữ liệu.", response.status, payload.code);
  return payload.data;
}

async function getCsrfHeader(): Promise<Record<string, string>> {
  let token = readCookie("XSRF-TOKEN");
  if (!token) {
    const response = await fetch(`${API_BASE}/api/v1/csrf-token`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    await responseData<Record<string, never>>(response);
    token = readCookie("XSRF-TOKEN");
  }
  if (!token) throw new ApiError("Không lấy được mã bảo vệ yêu cầu. Hãy tải lại trang và thử lại.", 403);
  return { "X-XSRF-TOKEN": token };
}

async function request<T>(path: string, init: RequestInit = {}, csrf = false): Promise<T> {
  const csrfHeader = csrf ? await getCsrfHeader() : {};
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json", ...csrfHeader, ...init.headers },
  });
  return responseData<T>(response);
}

export function fetchGalleryPage(cursor?: string | null): Promise<GalleryPage> {
  const query = cursor ? `?nextCursor=${encodeURIComponent(cursor)}` : "";
  return request<GalleryPage>(`/api/v1/images${query}`);
}

export async function loginAdmin(email: string, password: string): Promise<AuthState> {
  return request<AuthState>("/api/v1/auth/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }, true);
}

export function getAdminSession(): Promise<AuthState> {
  return request<AuthState>("/api/v1/auth/admin/sessions");
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  return request<UploadedImage>("/api/v1/images", { method: "POST", body: form }, true);
}

export function deleteImage(imageId: string): Promise<DeletedImage> {
  return request<DeletedImage>(`/api/v1/images/${encodeURIComponent(imageId)}`, { method: "DELETE" }, true);
}

export function logoutAdmin(): Promise<AuthState> {
  return request<AuthState>("/api/v1/auth/admin/sessions", { method: "DELETE" }, true);
}
