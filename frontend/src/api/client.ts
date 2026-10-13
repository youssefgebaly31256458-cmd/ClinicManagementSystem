/**
 * Centralized HTTP client for Shfaa (شفاء)
 * Connects to ASP.NET Core Web API via Vite /api proxy
 */

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

export { ApiClientError };

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('shfaa_token');

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto-set Content-Type for JSON bodies
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Ensure leading slash and base /api prefix
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    throw new ApiClientError(0, `Unable to reach server: ${message}`);
  }

  // 204 No Content handling (common on PUT/DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status} (${response.statusText})`;
    let validationErrors: Record<string, string[]> | undefined;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json();
        if (typeof errorJson === 'string') {
          errorMessage = errorJson;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.title) {
          errorMessage = errorJson.title;
        }
        if (errorJson.errors) {
          validationErrors = errorJson.errors;
          const firstKey = Object.keys(errorJson.errors)[0];
          if (firstKey && errorJson.errors[firstKey].length > 0) {
            errorMessage = errorJson.errors[firstKey][0];
          }
        }
      } else {
        const textError = await response.text();
        if (textError && textError.trim()) {
          errorMessage = textError.trim();
        }
      }
    } catch {
      // Failed to parse response body, fallback to default error message
    }

    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('shfaa:unauthorized'));
    }

    throw new ApiClientError(response.status, errorMessage, validationErrors);
  }

  // Parse JSON response
  try {
    const data = await response.json();
    return data as T;
  } catch {
    return {} as T;
  }
}
