/**
 * Hook custom para cálculos de métricas de pagos
 * Aplicando S (Single Responsibility): Responsable SOLO de cálculos
 * Reutilizable en múltiples componentes
 */

import { useMemo } from 'react';

export const usePayoutMetrics = (payoutEvents) => {
  const metrics = useMemo(() => {
    const succeeded = payoutEvents.filter(p => p.status === 'SUCCEEDED').length;
    const failed = payoutEvents.filter(p => p.status === 'FAILED').length;
    const totalPayouts = payoutEvents.length;
    
    if (totalPayouts === 0) {
      return {
        succeeded: 0,
        failed: 0,
        totalPayouts: 0,
        successRate: 0,
        totalVolume: 0,
        avgLatency: 0,
        providers: 0
      };
    }

    const successRate = ((succeeded / totalPayouts) * 100).toFixed(1);
    const totalVolume = payoutEvents.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgLatency = (
      payoutEvents.reduce((sum, p) => sum + (p.processing_time_sec || p.latency_ms / 1000 || 0), 0) 
      / totalPayouts
    ).toFixed(2);
    const providers = Array.from(new Set(payoutEvents.map(p => p.provider))).length;

    return {
      succeeded,
      failed,
      totalPayouts,
      successRate: parseFloat(successRate),
      totalVolume,
      avgLatency,
      providers
    };
  }, [payoutEvents]);

  return metrics;
};

export default usePayoutMetrics;
