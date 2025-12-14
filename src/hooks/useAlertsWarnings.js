import { useQuery } from '@tanstack/react-query';
import { OVERVIEW_ENDPOINT, apiClient } from '../config/apiConfig';

/**
 * Hook personalizado para obtener alertas (warnings) desde overview usando React Query
 * Filtra y mapea los activeIssues a formato de alertas
 */
export const useAlerts = (fromDate, toDate) => {
  return useQuery({
    queryKey: ['alerts', fromDate, toDate],
    queryFn: async () => {
      const url = OVERVIEW_ENDPOINT(fromDate, toDate);
      const data = await apiClient.get(url);

      // Map activeIssues to alerts format - only include issues with failures (excluding user-cancelled)
      const allProcessedAlerts = (data?.activeIssues || [])
        .filter(issue => {
          const isCancelled = issue.mainErrorCategory === 'USER';
          const hasFailures = (issue.failedEvents || 0) > 0 || (issue.errorRate || 0) > 0;
          return hasFailures && !isCancelled;
        })
        .map(issue => ({
          id: `${issue.merchantId}-${issue.incidentTag}`,
          provider: issue.provider,
          isCritical: false,
          severity: 'warning',
          errorCode: issue.incidentTag,
          errorMessage: issue.title,
          description: issue.description,
          failureCount: issue.failedEvents || 0,
          failureRate: (issue.errorRate || 0).toFixed(1),
          merchantName: issue.merchantName,
          countryCode: issue.countryCode,
          paymentMethod: issue.paymentMethod,
          suggestedAction: issue.suggestedActionType,
          firstSeen: issue.firstSeen,
          lastSeen: issue.lastSeen,
          mainErrorCategory: issue.mainErrorCategory,
          totalEvents: issue.totalEvents,
          mainErrorType: issue.mainErrorType
        }));

      return allProcessedAlerts;
    },
    enabled: !!fromDate && !!toDate, // Solo ejecutar si hay fechas
  });
};

export default useAlerts;
