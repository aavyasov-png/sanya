/**
 * Uzum Seller API Client
 * 
 * Base URL: https://api-seller.uzum.uz/api/seller-openapi/
 * 
 * Auth scheme can be configured via VITE_UZUM_AUTH_SCHEME:
 * - "Bearer" → Authorization: Bearer <token>
 * - "Token" → Authorization: Token <token>
 * - "Raw" → Authorization: <token>
 * Default: Bearer
 */

const BASE_URL = 'https://api-seller.uzum.uz/api/seller-openapi';

// Get auth scheme from env or default to Bearer
const AUTH_SCHEME = import.meta.env.VITE_UZUM_AUTH_SCHEME || 'Bearer';

/**
 * Build Authorization header based on scheme
 */
function buildAuthHeader(token: string): string {
  if (AUTH_SCHEME === 'Raw') {
    return token;
  }
  return `${AUTH_SCHEME} ${token}`;
}

/**
 * Base API request with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': buildAuthHeader(token),
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const status = response.status;

    // Handle errors
    if (!response.ok) {
      if (status === 401) {
        return { error: 'Неверный токен (401 Unauthorized)', status };
      }
      if (status === 403) {
        return { error: 'Доступ запрещён (403 Forbidden)', status };
      }
      if (status === 404) {
        return { error: 'Ресурс не найден (404 Not Found)', status };
      }
      if (status >= 500) {
        return { error: `Ошибка сервера Uzum (${status})`, status };
      }
      return { error: `HTTP ошибка ${status}`, status };
    }

    // Try to parse JSON response
    try {
      const data = await response.json();
      return { data, status };
    } catch {
      // Some endpoints may return empty response
      return { data: {} as T, status };
    }
  } catch (error: any) {
    // Network error or CORS
    if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
      return {
        error: 'CORS блокировка или сеть недоступна. Требуется backend-прокси.',
        status: 0
      };
    }
    return {
      error: error.message || 'Неизвестная ошибка',
      status: 0
    };
  }
}

/**
 * Test if token is valid
 * Uses /seller-info endpoint as it's typically available and lightweight
 */
export async function testToken(token: string): Promise<{
  valid: boolean;
  error?: string;
  sellerInfo?: any;
}> {
  if (!token || token.trim().length === 0) {
    return { valid: false, error: 'Токен пустой' };
  }

  // Try seller-info endpoint
  const result = await apiRequest('/seller-info', token, { method: 'GET' });

  if (result.error) {
    return { valid: false, error: result.error };
  }

  return { valid: true, sellerInfo: result.data };
}

/**
 * Get products list
 * Endpoint: /products (example, check real API docs)
 */
export async function getProducts(
  token: string,
  shopId?: number | string
): Promise<{
  success: boolean;
  products?: any[];
  error?: string;
}> {
  const params = shopId ? `?shopId=${shopId}` : '';
  const result = await apiRequest<{ items?: any[]; products?: any[] }>(
    `/products${params}`,
    token,
    { method: 'GET' }
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  // API may return different structures
  const products = result.data?.items || result.data?.products || [];
  return { success: true, products };
}

/**
 * Get shops list
 * Some sellers have multiple shops
 */
export async function getShops(token: string): Promise<{
  success: boolean;
  shops?: any[];
  error?: string;
}> {
  const result = await apiRequest<{ shops?: any[]; data?: any[] }>(
    '/shops',
    token,
    { method: 'GET' }
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  const shops = result.data?.shops || result.data?.data || [];
  return { success: true, shops };
}

/**
 * Get orders
 * Endpoint may vary, check API docs
 */
export async function getOrders(
  token: string,
  shopId?: number | string
): Promise<{
  success: boolean;
  orders?: any[];
  error?: string;
}> {
  const params = shopId ? `?shopId=${shopId}` : '';
  const result = await apiRequest<{ orders?: any[]; data?: any[] }>(
    `/orders${params}`,
    token,
    { method: 'GET' }
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  const orders = result.data?.orders || result.data?.data || [];
  return { success: true, orders };
}
