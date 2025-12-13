/**
 * Componente reutilizable para tarjetas de estadísticas
 * Aplicando D (Dependency Inversion): Depende de props, no de lógica específica
 */

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  bgColor = 'rgba(15, 122, 255, 0.1)', 
  borderColor = '#0F7AFF',
  valueColor = 'inherit'
}) => {
  return (
    <Paper sx={{
      p: 2,
      background: bgColor,
      border: `1px solid ${borderColor}33`,
      transition: 'all 0.3s ease'
    }}>
      <Typography variant="caption" sx={{
        color: '#A0AEC0',
        fontWeight: 600,
        display: 'block',
        mb: 1
      }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{
        fontWeight: 700,
        mt: 1,
        color: valueColor
      }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  bgColor: PropTypes.string,
  borderColor: PropTypes.string,
  valueColor: PropTypes.string
};

export default StatCard;
