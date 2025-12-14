/**
 * Hook custom para cálculo de seguridad
 * Aplicando S (Single Responsibility): Responsable SOLO de score de seguridad
 * Reutilizable en múltiples componentes
 */

import { useMemo } from 'react';
import { SECURITY_SCORE_WEIGHTS, SECURITY_GRADES } from '../constants/alertConfig';

export const useSecurityScore = (payinEvents, successRate) => {
  const score = useMemo(() => {
    let score = 100;
    const totalPayins = payinEvents.length;

    if (totalPayins === 0) return { score: 0, grade: 'F', factors: { success: 0, risk: 0, latency: 0, diversification: 0 } };

    // Factor 1: Tasa de éxito (40 puntos máx)
    const successFactor = (parseFloat(successRate) / 100) * SECURITY_SCORE_WEIGHTS.SUCCESS_RATE;
    score -= (SECURITY_SCORE_WEIGHTS.SUCCESS_RATE - successFactor);

    // Factor 2: Validaciones de riesgo (30 puntos máx)
    const passedRiskChecks = payinEvents.filter(p => p.risk_checks && p.risk_checks.length > 0).length;
    const riskCheckFactor = (passedRiskChecks / totalPayins) * SECURITY_SCORE_WEIGHTS.RISK_CHECKS;
    score -= (SECURITY_SCORE_WEIGHTS.RISK_CHECKS - riskCheckFactor);

    // Factor 3: Latencia/Timeouts (20 puntos máx)
    const timeouts = payinEvents.filter(p => p.error_code === 'PROVIDER_TIMEOUT').length;
    const latencyPenalty = (timeouts / totalPayins) * SECURITY_SCORE_WEIGHTS.LATENCY;
    score -= latencyPenalty;

    // Factor 4: Diversificación de proveedores (10 puntos máx)
    const providers = Array.from(new Set(payinEvents.map(p => p.provider))).length;
    const diversificationFactor = Math.min((providers / 3) * SECURITY_SCORE_WEIGHTS.DIVERSIFICATION, SECURITY_SCORE_WEIGHTS.DIVERSIFICATION);
    score += diversificationFactor;

    const finalScore = Math.max(Math.min(score, 100), 0);

    // Determinar grade
    let grade = 'F';
    for (const [gradeKey, range] of Object.entries(SECURITY_GRADES)) {
      if (finalScore >= range.min && finalScore <= range.max) {
        grade = gradeKey;
        break;
      }
    }

    return { 
      score: finalScore.toFixed(1), 
      grade,
      factors: {
        success: successFactor.toFixed(1),
        risk: riskCheckFactor.toFixed(1),
        latency: (SECURITY_SCORE_WEIGHTS.LATENCY - latencyPenalty).toFixed(1),
        diversification: diversificationFactor.toFixed(1)
      }
    };
  }, [payinEvents, successRate]);

  return score;
};

export default useSecurityScore;
