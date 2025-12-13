import { useState, useCallback } from 'react';
import { apiClient, PAYOUTS_ENDPOINTS } from '../config/apiConfig';

/**
 * Hook personalizado para gestionar llamadas API de Payouts
 * Maneja carga, errores y datos de pagos
 */
const usePayouts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payouts, setPayouts] = useState([]);

  // Obtener todos los payouts
  const getAllPayouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getAll());
      setPayouts(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payouts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener payouts por país
  const getPayoutsByCountry = useCallback(async (country) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getByCountry(country));
      setPayouts(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching payouts for ${country}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener payouts por provider
  const getPayoutsByProvider = useCallback(async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getByProvider(providerId));
      setPayouts(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching payouts for provider ${providerId}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener payouts por país y provider
  const getPayoutsByCountryAndProvider = useCallback(async (country, provider) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getByCountryAndProvider(country, provider));
      setPayouts(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching payouts for ${provider} in ${country}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener métricas de payouts
  const getPayoutsMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PAYOUTS_ENDPOINTS.getMetrics());
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payouts metrics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    payouts,
    loading,
    error,
    getAllPayouts,
    getPayoutsByCountry,
    getPayoutsByProvider,
    getPayoutsByCountryAndProvider,
    getPayoutsMetrics,
  };
};

export default usePayouts;
