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
      const alerts = Array.isArray(data) ? data : [];
      // Mapear alertas críticas al formato esperado con campos para recomendaciones
      return alerts.map(alert => ({
        id: alert.id || `${alert.provider}-${alert.merchantName}-${alert.countryCode}-${Date.now()}`,
        provider: alert.provider,
        isCritical: true,
        severity: 'critical',
        errorCode: alert.incidentTag || alert.category || 'CRITICAL_ALERT',
        errorMessage: alert.message || 'Critical alert detected',
        description: alert.description || '',
        failureCount: alert.failureCount || 0,
        failureRate: alert.failureRate || '0',
        merchantName: alert.merchantName,
        countryCode: alert.countryCode,
        paymentMethod: alert.paymentMethod || '',
        suggestedAction: alert.suggestedAction || '',
        firstSeen: alert.firstSeen || new Date().toISOString(),
        lastSeen: alert.lastSeen || new Date().toISOString(),
        mainErrorCategory: alert.category || 'PROVIDER', // Usar 'category' del API o default 'PROVIDER'
        totalEvents: alert.totalEvents || 1,
        mainErrorType: alert.mainErrorType || 'critical_error'
      }));
    },
    enabled: !!fromDate && !!toDate, // Solo ejecutar si hay fechas
  });
};

export default useCriticalAlerts;
