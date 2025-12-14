import { useState, useCallback } from 'react';
import { apiClient, PAYOUTS_ENDPOINTS } from '../config/apiConfig';

/**
 * Hook personalizado para gestionar llamadas API de Payins
 * Maneja carga, errores y datos de pagos entrantes (payins)
 */
const usePayins = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payins, setPayins] = useState([]);

  // Obtener todos los payins
  const getAllPayins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getAll());
      setPayins(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payins:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener payins por país
  const getPayinsByCountry = useCallback(async (country) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getByCountry(country));
      setPayins(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching payins for ${country}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener payins por provider
  const getPayinsByProvider = useCallback(async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getByProvider(providerId));
      setPayins(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching payins for provider ${providerId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener payins por país y provider
  const getPayinsByCountryAndProvider = useCallback(async (country, provider) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getByCountryAndProvider(country, provider));
      setPayins(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching payins for ${provider} in ${country}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener métricas de payins
  const getPayinsMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getMetrics());
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payins metrics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payins,
    loading,
    error,
    getAllPayins,
    getPayinsByCountry,
    getPayinsByProvider,
    getPayinsByCountryAndProvider,
    getPayinsMetrics,
  };
};

export default usePayins;
