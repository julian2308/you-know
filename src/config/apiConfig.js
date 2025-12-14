/**
 * Configuración centralizada para las llamadas API
 * Las URLs se pueden definir vía variables de entorno VITE_*
 */

const API_BASE_URL = 'https://kerri-presusceptible-gallfly.ngrok-free.dev/api';

// Endpoint de overview
export const OVERVIEW_ENDPOINT = (from, to) =>
  `${API_BASE_URL}/overview?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;


// Endpoints de Merchants (histórico / detalle)
export const MERCHANT_DETAIL_ENDPOINT = (merchantId, from, to) =>
  `${API_BASE_URL}/merchants/${merchantId}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;


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
      console.log('Fetching from:', url);
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

      console.log('Response status:', response.status);
      console.log('Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText.substring(0, 200));
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Invalid content type:', contentType);
        console.error('Response preview:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = await response.json();
      console.log('Successfully parsed JSON:', data);
      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  async post(url, data, options = {}) {
    try {
      console.log('POST to:', url, 'with payload:', data);
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
        console.error('HTTP Error:', response.status, errorText.substring(0, 200));
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Invalid content type:', contentType);
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = await response.json();
      console.log('Successfully parsed JSON:', data);
      return data;
    } catch (error) {
      console.error('API POST Error:', error);
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
      console.error('API PUT Error:', error);
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
      console.error('API DELETE Error:', error);
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
