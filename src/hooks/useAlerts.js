/**
 * Hook custom para generación de alertas
 * Aplicando S (Single Responsibility): Responsable SOLO de lógica de alertas
 * Reutilizable en múltiples componentes
 */

import { useMemo } from 'react';
import {
  SEVERITY_LEVELS,
  SEVERITY_THRESHOLDS,
  SEVERITY_ORDER,
  ERROR_ACTIONS
} from '../constants/alertConfig';

export const useAlerts = (payoutEvents, securityScore) => {
  const alerts = useMemo(() => {
    const alertsList = [];
    const providerErrors = {};

    // Agrupar errores por proveedor
    payoutEvents.forEach(payout => {
      if (payout.status === 'FAILED') {
        if (!providerErrors[payout.provider]) {
          providerErrors[payout.provider] = [];
        }
        providerErrors[payout.provider].push(payout);
      }
    });

    // Crear alertas basadas en errores
    Object.entries(providerErrors).forEach(([provider, failedPayouts]) => {
      const providerPayouts = payoutEvents.filter(p => p.provider === provider);
      const failureRate = (failedPayouts.length / providerPayouts.length) * 100;
      const totalImpact = failedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

      // Determinar severidad basada en seguridad y tasa de fallo
      let severity = SEVERITY_LEVELS.INFO;
      
      if (parseFloat(securityScore) < SEVERITY_THRESHOLDS.CRITICAL_SECURITY_SCORE || 
          failureRate > SEVERITY_THRESHOLDS.CRITICAL_FAILURE_RATE) {
        severity = SEVERITY_LEVELS.CRITICAL;
      } else if (
        failureRate > SEVERITY_THRESHOLDS.WARNING_FAILURE_RATE || 
        parseFloat(securityScore) < SEVERITY_THRESHOLDS.WARNING_SECURITY_SCORE
      ) {
        severity = SEVERITY_LEVELS.WARNING;
      }

      // Obtener acciones recomendadas
      const errorType = failedPayouts[0].error_code;
      const actions = ERROR_ACTIONS[errorType] || SEVERITY_THRESHOLDS.DEFAULT_ACTIONS;

      alertsList.push({
        id: `${provider}-${Date.now()}`,
        provider,
        severity,
        errorCode: errorType,
        errorMessage: failedPayouts[0].error_message,
        failureCount: failedPayouts.length,
        failureRate: failureRate.toFixed(1),
        totalImpact,
        actions,
        affectedPayouts: failedPayouts
      });
    });

    // Ordenar por severidad
    return alertsList.sort((a, b) => {
      return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    });
  }, [payoutEvents, securityScore]);

  return alerts;
};

export default useAlerts;
