import { useQuery } from '@tanstack/react-query';
import { OVERVIEW_ENDPOINT, apiClient } from '../config/apiConfig';

/**
 * Hook personalizado para obtener datos de overview usando React Query
 * Proporciona caching automático y sincronización de estado
 */
export const useOverview = (fromDate, toDate) => {
  return useQuery({
    queryKey: ['overview', fromDate, toDate],
    queryFn: async () => {
      const url = OVERVIEW_ENDPOINT(fromDate, toDate);
      return await apiClient.get(url);
    },
    enabled: !!fromDate && !!toDate, // Solo ejecutar si hay fechas
  });
};

export default useOverview;
