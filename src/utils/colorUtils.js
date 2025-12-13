/**
 * Funciones utilitarias para colores de alertas
 * Aplicando S (Single Responsibility): Responsable SOLO de mapeos de colores
 */

import { SEVERITY_CONFIG } from '../constants/alertConfig';

/**
 * Obtiene la configuración de colores para una severidad
 * @param {string} severity - Nivel de severidad (critical, warning, info)
 * @returns {object} Configuración de colores
 */
export const getSeverityColor = (severity) => {
  return SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
};

/**
 * Obtiene el color de fondo basado en severidad
 * @param {string} severity - Nivel de severidad
 * @returns {string} Color de fondo en rgba
 */
export const getSeverityBgColor = (severity) => {
  return getSeverityColor(severity).bg;
};

/**
 * Obtiene el color del borde basado en severidad
 * @param {string} severity - Nivel de severidad
 * @returns {string} Color del borde en hex
 */
export const getSeverityBorderColor = (severity) => {
  return getSeverityColor(severity).border;
};

/**
 * Obtiene el color del ícono basado en severidad
 * @param {string} severity - Nivel de severidad
 * @returns {string} Color del ícono en hex
 */
export const getSeverityIconColor = (severity) => {
  return getSeverityColor(severity).icon;
};

/**
 * Obtiene el texto descriptivo basado en severidad
 * @param {string} severity - Nivel de severidad
 * @returns {string} Texto descriptivo (CRÍTICO, ADVERTENCIA, INFO)
 */
export const getSeverityText = (severity) => {
  return getSeverityColor(severity).text;
};

export default {
  getSeverityColor,
  getSeverityBgColor,
  getSeverityBorderColor,
  getSeverityIconColor,
  getSeverityText
};
