import { useState, useCallback } from 'react';
import { apiClient, PROVIDERS_ENDPOINTS } from '../config/apiConfig';

/**
 * Hook personalizado para gestionar llamadas API de Providers
 * Maneja carga, errores y datos de proveedores
 */
const useProviders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState([]);

  // Obtener todos los providers
  const getAllProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PROVIDERS_ENDPOINTS.getAll());
      setProviders(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching providers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener providers por país
  const getProvidersByCountry = useCallback(async (country) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PROVIDERS_ENDPOINTS.getByCountry(country));
      setProviders(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching providers for ${country}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un provider específico por ID
  const getProviderById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PROVIDERS_ENDPOINTS.getById(id));
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching provider ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener métricas de un provider específico
  const getProviderMetrics = useCallback(async (providerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PROVIDERS_ENDPOINTS.getMetrics(providerId));
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching metrics for provider ${providerId}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener provider por país y nombre
  const getProviderByCountryAndName = useCallback(async (country, name) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get(PROVIDERS_ENDPOINTS.getByCountryAndName(country, name));
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching provider ${name} in ${country}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    providers,
    loading,
    error,
    getAllProviders,
    getProvidersByCountry,
    getProviderById,
    getProviderMetrics,
    getProviderByCountryAndName,
  };
};

export default useProviders;
