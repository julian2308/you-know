import { useQuery } from '@tanstack/react-query';
import { CRITICAL_ALERTS_ENDPOINT, apiClient } from '../config/apiConfig';

/**
 * Hook personalizado para obtener alertas críticas usando React Query
 * Proporciona caching automático y sincronización de estado
 */
export const useCriticalAlerts = (fromDate, toDate) => {
  return useQuery({
    queryKey: ['criticalAlerts', fromDate, toDate],
    queryFn: async () => {
      const url = CRITICAL_ALERTS_ENDPOINT(fromDate, toDate);
      const data = await apiClient.get(url);
      // El API devuelve un array directo
      return Array.isArray(data) ? data : [];
    },
    enabled: !!fromDate && !!toDate, // Solo ejecutar si hay fechas
  });
};

export default useCriticalAlerts;
