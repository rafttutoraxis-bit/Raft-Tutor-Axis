import { API_URL } from "../config";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Service helper to manage request pipeline with auto auth headers & refresh token retries
class ApiService {
  private async getHeaders(contentType = "application/json"): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    const token = localStorage.getItem("rta_admin_token") || localStorage.getItem("rta_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem("rta_refresh_token");
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("rta_admin_token", data.token);
        localStorage.setItem("rta_token", data.token);
        return true;
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
    }
    return false;
  }

  public async request<T = any>(endpoint: string, options: FetchOptions = {}, skipContentType = false): Promise<T> {
    const defaultHeaders = await this.getHeaders(skipContentType ? "" : "application/json");
    const mergedHeaders = { ...defaultHeaders, ...options.headers };
    
    let url = endpoint;
    if (!endpoint.startsWith("http")) {
      url = `${API_URL}${endpoint}`;
    }

    let response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });

    // Auto retry once if token is expired (401 Unauthorized)
    if (response.status === 401) {
      const refreshed = await this.handleRefreshToken();
      if (refreshed) {
        const retryHeaders = await this.getHeaders(skipContentType ? "" : "application/json");
        const finalHeaders = { ...retryHeaders, ...options.headers };
        response = await fetch(url, {
          ...options,
          headers: finalHeaders,
        });
      } else {
        // Clear tokens if session has expired completely
        localStorage.removeItem("rta_token");
        localStorage.removeItem("rta_admin_token");
        localStorage.removeItem("rta_refresh_token");
        localStorage.removeItem("rta_user");
        window.dispatchEvent(new Event("auth-changed"));
      }
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP error! Status: ${response.status}`);
    }

    return response.json();
  }

  public get<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = any>(endpoint: string, body?: any, options: FetchOptions = {}): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    }, isFormData);
  }

  public delete<T = any>(endpoint: string, body?: any, options: FetchOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new ApiService();
