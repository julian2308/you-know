/**
 * Configuración centralizada de alertas
 * Aplicando el principio O (Open/Closed) de SOLID
 * - Abierto para extensión (nuevas severidades)
 * - Cerrado para modificación (cambios en dos lugares)
 */

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
};

export const SEVERITY_CONFIG = {
  critical: {
    bg: 'rgba(255, 59, 48, 0.1)',
    border: '#FF3B30',
    icon: '#FF3B30',
    text: 'CRÍTICO'
  },
  warning: {
    bg: 'rgba(255, 149, 0, 0.1)',
    border: '#FF9500',
    icon: '#FF9500',
    text: 'ADVERTENCIA'
  },
  info: {
    bg: 'rgba(15, 122, 255, 0.1)',
    border: '#0F7AFF',
    icon: '#0F7AFF',
    text: 'INFO'
  }
};

export const SEVERITY_ORDER = {
  critical: 0,
  warning: 1,
  info: 2
};

// Acciones recomendadas por tipo de error
export const ERROR_ACTIONS = {
  'PROVIDER_TIMEOUT': [
    'Aumentar timeout de 30s a 60s en configuración',
    'Verificar conectividad con proveedor',
    'Usar ruta alternativa temporalmente',
    'Contactar soporte del proveedor'
  ],
  'INSUFFICIENT_FUNDS': [
    'Recargar balance de cuenta del proveedor',
    'Configurar fallback a proveedor alternativo',
    'Revisar límites de payout establecidos'
  ],
  'INVALID_ACCOUNT': [
    'Verificar datos de cuenta del destinatario',
    'Contactar comerciante para validar datos',
    'Revisar formato de cuenta requerido'
  ]
};

// Reglas de severidad (magic numbers documentados)
export const SEVERITY_THRESHOLDS = {
  CRITICAL_SECURITY_SCORE: 60,      // Score < 60 = crítico
  CRITICAL_FAILURE_RATE: 50,        // Tasa fallo > 50% = crítico
  WARNING_FAILURE_RATE: 25,         // Tasa fallo > 25% = advertencia
  WARNING_SECURITY_SCORE: 80,       // Score < 80 = advertencia
  DEFAULT_ACTIONS: [
    'Revisar logs de error detallados',
    'Contactar soporte técnico'
  ]
};

// Puntuación de seguridad (magic numbers documentados)
export const SECURITY_SCORE_WEIGHTS = {
  SUCCESS_RATE: 40,                 // Éxito = 40 puntos
  RISK_CHECKS: 30,                  // Validaciones = 30 puntos
  LATENCY: 20,                      // Latencia = 20 puntos
  DIVERSIFICATION: 10               // Diversificación = 10 puntos
};

export const SECURITY_GRADES = {
  'A+': { min: 95, max: 100 },
  'A': { min: 90, max: 94 },
  'B+': { min: 80, max: 89 },
  'B': { min: 70, max: 79 },
  'C': { min: 60, max: 69 },
  'F': { min: 0, max: 59 }
};
