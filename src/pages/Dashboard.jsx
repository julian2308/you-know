import React from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Chip, Icon } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const Dashboard = () => {
  // KPIs - Simplificados y enfocados en lo que importa
  const kpis = {
    totalTransactions: 4567,
    successRate: 98.7,
    failedTransactions: 61,
    totalVolume: '$2.45M',
    avgRoute: 'Primary (92%)',
    securityScore: 'A+',
    avgSpeed: '1.2s'
  };

  const MetricCard = ({ icon: IconComponent, title, value, subtitle, color = '#0F7AFF', bgColor = 'rgba(15, 122, 255, 0.1)' }) => (
    <Paper sx={{ 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column',
      background: bgColor,
      border: `1px solid ${color}33`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${color}20`,
      }
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
        <Box sx={{ 
          p: 1, 
          borderRadius: '8px', 
          background: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconComponent sx={{ fontSize: 20 }} />
        </Box>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Panel de Control de Pagos
        </Typography>
        <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
          Sistema de Auto-enrutamiento Inteligente • Transformando datos técnicos complejos en términos simples
        </Typography>
      </Box>

      {/* KPIs Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={TrendingUpIcon}
            title="Transacciones"
            value={kpis.totalTransactions.toLocaleString()}
            subtitle="Últimas 24h"
            color="#0F7AFF"
            bgColor="rgba(15, 122, 255, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={CheckCircleIcon}
            title="Tasa de Éxito"
            value={`${kpis.successRate}%`}
            subtitle="Transacciones aprobadas"
            color="#00D084"
            bgColor="rgba(0, 208, 132, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={AccountBalanceWalletIcon}
            title="Volumen Total"
            value={kpis.totalVolume}
            subtitle="Monto procesado"
            color="#FFB81C"
            bgColor="rgba(255, 184, 28, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={SpeedIcon}
            title="Velocidad Promedio"
            value={kpis.avgSpeed}
            subtitle="Tiempo de procesamiento"
            color="#FF6B6B"
            bgColor="rgba(255, 107, 107, 0.1)"
          />
        </Grid>
      </Grid>

      {/* Información de Enrutamiento */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SwapCallsIcon sx={{ color: '#0F7AFF', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Estrategia de Enrutamiento
              </Typography>
            </Box>
            <Box sx={{ space: 2 }}>
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Ruta Primaria (Visa/MC)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#00D084' }}>92%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Ruta Secundaria (Alternativa)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#FF9500' }}>6%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={6} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Ruta Tertiary (Backup)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#A0AEC0' }}>2%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={2} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <SecurityIcon sx={{ color: '#00D084', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Estado de Seguridad
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 208, 132, 0.1)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                    Score de Seguridad
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#00D084' }}>
                    A+
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(0, 208, 132, 0.1)', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                    Transacciones Seguras
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#00D084' }}>
                    99.8%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(15, 122, 255, 0.1)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                ✓ Certificación PCI DSS 3.2.1 activa
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Transacciones Recientes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Transacciones Recientes
        </Typography>
        <Box sx={{ 
          overflowX: 'auto',
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
          },
          '& th': {
            textAlign: 'left',
            padding: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#A0AEC0',
            textTransform: 'uppercase',
          },
          '& td': {
            padding: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          },
          '& tr:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }
        }}>
          <table>
            <thead>
              <tr>
                <th>Comercio</th>
                <th>Monto</th>
                <th>Proveedor</th>
                <th>Ruta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Typography variant="body2">TechStore Pro</Typography></td>
                <td><Typography variant="body2" sx={{ fontWeight: 600 }}>$542.50</Typography></td>
                <td><Typography variant="body2">Visa</Typography></td>
                <td><Chip label="Primaria" size="small" sx={{ backgroundColor: 'rgba(0, 208, 132, 0.2)', color: '#00D084' }} /></td>
                <td><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircleIcon sx={{ fontSize: 18, color: '#00D084' }} /><Typography variant="body2">Aprobado</Typography></Box></td>
              </tr>
              <tr>
                <td><Typography variant="body2">FastShip Inc</Typography></td>
                <td><Typography variant="body2" sx={{ fontWeight: 600 }}>$1,234.00</Typography></td>
                <td><Typography variant="body2">Mastercard</Typography></td>
                <td><Chip label="Primaria" size="small" sx={{ backgroundColor: 'rgba(0, 208, 132, 0.2)', color: '#00D084' }} /></td>
                <td><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircleIcon sx={{ fontSize: 18, color: '#00D084' }} /><Typography variant="body2">Aprobado</Typography></Box></td>
              </tr>
              <tr>
                <td><Typography variant="body2">Global Retail</Typography></td>
                <td><Typography variant="body2" sx={{ fontWeight: 600 }}>$89.99</Typography></td>
                <td><Typography variant="body2">Amex</Typography></td>
                <td><Chip label="Secundaria" size="small" sx={{ backgroundColor: 'rgba(255, 184, 28, 0.2)', color: '#FFB81C' }} /></td>
                <td><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CheckCircleIcon sx={{ fontSize: 18, color: '#00D084' }} /><Typography variant="body2">Aprobado</Typography></Box></td>
              </tr>
              <tr>
                <td><Typography variant="body2">Digital Market</Typography></td>
                <td><Typography variant="body2" sx={{ fontWeight: 600 }}>$45.00</Typography></td>
                <td><Typography variant="body2">Visa</Typography></td>
                <td><Chip label="Primaria" size="small" sx={{ backgroundColor: 'rgba(0, 208, 132, 0.2)', color: '#00D084' }} /></td>
                <td><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><WarningIcon sx={{ fontSize: 18, color: '#FF9500' }} /><Typography variant="body2">Revisión</Typography></Box></td>
              </tr>
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
