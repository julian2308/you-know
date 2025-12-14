/**
 * Hook custom para cálculos de métricas de pagos
 * Aplicando S (Single Responsibility): Responsable SOLO de cálculos
 * Reutilizable en múltiples componentes
 */

import { useMemo } from 'react';

export const usePayinMetrics = (payinEvents) => {
  const metrics = useMemo(() => {
    const succeeded = payinEvents.filter(p => p.status === 'SUCCEEDED').length;
    const failed = payinEvents.filter(p => p.status === 'FAILED').length;
    const totalPayins = payinEvents.length;

    if (totalPayins === 0) {
      return {
        succeeded: 0,
        failed: 0,
        totalPayins: 0,
        successRate: 0,
        totalVolume: 0,
        avgLatency: 0,
        providers: 0
      };
    }

    const successRate = ((succeeded / totalPayins) * 100).toFixed(1);
    const totalVolume = payinEvents.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgLatency = (
      payinEvents.reduce((sum, p) => sum + (p.processing_time_sec || p.latency_ms / 1000 || 0), 0) 
      / totalPayins
    ).toFixed(2);
    const providers = Array.from(new Set(payinEvents.map(p => p.provider))).length;

    return {
      succeeded,
      failed,
      totalPayins,
      successRate: parseFloat(successRate),
      totalVolume,
      avgLatency,
      providers
    };
  }, [payinEvents]);

  return metrics;
};

export default usePayinMetrics;
