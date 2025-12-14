/**
 * Configuración centralizada para las llamadas API
 * Las URLs se pueden definir vía variables de entorno VITE_*
 */

const API_BASE_URL = 'https://preearthquake-shinily-lorenza.ngrok-free.dev/api';

// Endpoint de overview
export const OVERVIEW_ENDPOINT = (from, to) =>
  `${API_BASE_URL}/overview?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;


// Endpoints de Merchants (histórico / detalle)
export const MERCHANT_DETAIL_ENDPOINT = (merchantId, from, to) =>
  `${API_BASE_URL}/merchants/${merchantId}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

// Endpoint para obtener todos los merchants con sus providers
export const ALL_MERCHANTS_ENDPOINT = () =>
  `${API_BASE_URL}/merchants`;

// Endpoint para obtener alertas críticas
export const CRITICAL_ALERTS_ENDPOINT = (from, to) =>
  `${API_BASE_URL}/alertas?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;


// Endpoints de Providers
const PROVIDERS_ENDPOINTS = {
  getAll: () => `${API_BASE_URL}/providers`,
  getByCountry: (country) => `${API_BASE_URL}/providers/country/${country}`,
  getById: (id) => `${API_BASE_URL}/providers/${id}`,
  getMetrics: (providerId) => `${API_BASE_URL}/providers/${providerId}/metrics`,
  getByCountryAndName: (country, name) => `${API_BASE_URL}/providers/${country}/${name}`,
};

// Endpoints de Payouts
const PAYOUTS_ENDPOINTS = {
  getAll: () => `${API_BASE_URL}/payouts`,
  getByCountry: (country) => `${API_BASE_URL}/payouts/country/${country}`,
  getByProvider: (providerId) => `${API_BASE_URL}/payouts/provider/${providerId}`,
  getByCountryAndProvider: (country, provider) => `${API_BASE_URL}/payouts/country/${country}/provider/${provider}`,
  getMetrics: () => `${API_BASE_URL}/payouts/metrics`,
};

// Endpoints de Seguridad/Análisis
const SECURITY_ENDPOINTS = {
  getScore: () => `${API_BASE_URL}/security/score`,
  getScoreByCountry: (country) => `${API_BASE_URL}/security/score/country/${country}`,
  getAlerts: () => `${API_BASE_URL}/security/alerts`,
};

// Función auxiliar para hacer llamadas API
export const apiClient = {
  async get(url, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'You-Know-Dashboard',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'omit',
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON content type`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async post(url, data, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'You-Know-Dashboard',
          ...options.headers,
        },
        body: JSON.stringify(data),
        mode: 'cors',
        credentials: 'omit',
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async put(url, data, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  async delete(url, options = {}) {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export {
  API_BASE_URL,
  PROVIDERS_ENDPOINTS,
  PAYOUTS_ENDPOINTS,
  SECURITY_ENDPOINTS,
};
