import { useQuery } from '@tanstack/react-query';
import { ALL_MERCHANTS_ENDPOINT, apiClient } from '../config/apiConfig';

/**
 * Hook personalizado para obtener todos los merchants usando React Query
 * Con mayor tiempo de caché ya que esta data cambia poco
 */
export const useMerchantsData = () => {
  return useQuery({
    queryKey: ['allMerchants'],
    queryFn: async () => {
      const url = ALL_MERCHANTS_ENDPOINT();
      return await apiClient.get(url);
    },
    staleTime: 1000 * 60 * 15, // 15 minutos para merchants (cambian menos)
    gcTime: 1000 * 60 * 30, // 30 minutos
  });
};

export default useMerchantsData;
