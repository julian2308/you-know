import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Chip, Icon, Button, Select, MenuItem, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import { mockData } from '../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  
  // Obtener lista de países únicos
  const allCountries = Array.from(new Set(mockData.payoutEvents.map(p => p.country))).sort();
  
  // Filtrar payouts por país
  const payouts = selectedCountry === 'ALL' 
    ? mockData.payoutEvents 
    : mockData.payoutEvents.filter(p => p.country === selectedCountry);
  const succeeded = payouts.filter(p => p.status === 'SUCCEEDED').length;
  const failed = payouts.filter(p => p.status === 'FAILED').length;
  const totalPayouts = payouts.length;
  const successRate = ((succeeded / totalPayouts) * 100).toFixed(1);
  const totalVolume = payouts.reduce((sum, p) => sum + p.amount, 0);
  const avgLatency = (payouts.reduce((sum, p) => sum + (p.processing_time_sec || p.latency_ms / 1000), 0) / totalPayouts).toFixed(2);

  // Calcular Security Score basado en múltiples factores
  const calculateSecurityScore = () => {
    let score = 100;
    
    // 1. Factor: Tasa de éxito (60 puntos máx)
    const successFactor = (parseFloat(successRate) / 100) * 60;
    score -= (60 - successFactor);
    
    // 2. Factor: Latencia (20 puntos máx - penalizar timeouts)
    const timeouts = payouts.filter(p => p.error_code === 'PROVIDER_TIMEOUT').length;
    const latencyPenalty = (timeouts / totalPayouts) * 20;
    score -= latencyPenalty;
    
    // 3. Factor: Diversificación de proveedores por país (20 puntos máx)
    const providersByCountry = {};
    payouts.forEach(p => {
      if (!providersByCountry[p.country]) {
        providersByCountry[p.country] = new Set();
      }
      providersByCountry[p.country].add(p.provider);
    });
    
    const countries = Object.keys(providersByCountry);
    const countriesWithMultipleProviders = countries.filter(country => providersByCountry[country].size >= 2).length;
    
    // Solo otorga puntos si TODOS los países tienen al menos 2 proveedores
    const diversificationFactor = (countriesWithMultipleProviders === countries.length) ? 20 : 
      (countriesWithMultipleProviders / countries.length) * 20;
    
    score += diversificationFactor;
    
    const finalScore = Math.max(score, 0);
    
    return {
      score: finalScore,
      factors: {
        success: successFactor.toFixed(1),
        latency: (20 - latencyPenalty).toFixed(1),
        diversification: diversificationFactor.toFixed(1)
      }
    };
  };

  const securityScoreData = calculateSecurityScore();
  const securityScore = securityScoreData.score;
  const securityFactors = securityScoreData.factors;
  const getSecurityGrade = (score) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'F';
  };

  // Generar alertas inteligentes por proveedor
  const generateAlerts = () => {
    const alerts = [];
    const providerErrors = {};

    // Agrupar errores por proveedor
    payouts.forEach(payout => {
      if (payout.status === 'FAILED') {
        if (!providerErrors[payout.provider]) {
          providerErrors[payout.provider] = [];
        }
        providerErrors[payout.provider].push(payout);
      }
    });

    // Crear alertas basadas en errores
    Object.entries(providerErrors).forEach(([provider, failedPayouts]) => {
      const failureRate = (failedPayouts.length / payouts.filter(p => p.provider === provider).length) * 100;
      const totalImpact = failedPayouts.reduce((sum, p) => sum + p.amount, 0);

      // Determinar severidad basada en el score de seguridad y tasa de fallo
      let severity = 'info';
      if (securityScore < 60 || failureRate > 50) severity = 'critical';
      else if (failureRate > 25 || securityScore < 80) severity = 'warning';

      // Acciones recomendadas por tipo de error
      const actionsByError = {
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

      const errorType = failedPayouts[0].error_code;
      const actions = actionsByError[errorType] || [
        'Revisar logs de error detallados',
        'Contactar soporte técnico'
      ];

      alerts.push({
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

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };

  const alerts = generateAlerts();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: 'rgba(255, 59, 48, 0.1)', border: '#FF3B30', icon: '#FF3B30', text: 'CRÍTICO' };
      case 'warning':
        return { bg: 'rgba(255, 149, 0, 0.1)', border: '#FF9500', icon: '#FF9500', text: 'ADVERTENCIA' };
      case 'info':
        return { bg: 'rgba(15, 122, 255, 0.1)', border: '#0F7AFF', icon: '#0F7AFF', text: 'INFO' };
      default:
        return { bg: 'rgba(160, 174, 192, 0.1)', border: '#A0AEC0', icon: '#A0AEC0', text: 'INFO' };
    }
  };

  const kpis = {
    totalPayouts,
    successRate: parseFloat(successRate),
    failedPayouts: failed,
    totalVolume: `$${(totalVolume / 1000).toFixed(1)}K`,
    avgLatency: `${avgLatency}s`,
    providers: Array.from(new Set(payouts.map(p => p.provider))).length,
    securityScore: securityScore.toFixed(1),
    securityGrade: getSecurityGrade(securityScore),
    alertCount: alerts.filter(a => a.severity === 'critical').length
  };

  const MetricCard = ({ icon: IconComponent, title, value, subtitle, color = '#0F7AFF', bgColor = 'rgba(15, 122, 255, 0.1)' }) => (
    <Paper sx={{ 
      p: 3, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      background: bgColor,
      border: `1px solid ${color}33`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${color}20`,
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
        <Box sx={{ 
          p: 1, 
          borderRadius: '8px', 
          background: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1
        }}>
          <IconComponent sx={{ fontSize: 22 }} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: '#A0AEC0', textAlign: 'center', display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Panel de Control de Payouts
            </Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
              Sistema de Procesamiento y Enrutamiento de Transferencias • Monitoreo en tiempo real de pagos a comerciantes
            </Typography>
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              sx={{
                backgroundColor: '#151B2E',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.08)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0F7AFF'
                }
              }}
            >
              <MenuItem value="ALL">Todos los países</MenuItem>
              {allCountries.map(country => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Card de Alertas Rápido (eliminada, ahora solo en Topbar) */}

      {/* KPIs Grid */}
      <Grid container spacing={3} sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' } }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={TrendingUpIcon}
            title="Payouts Procesados"
            value={kpis.totalPayouts}
            subtitle="Total en período"
            color="#0F7AFF"
            bgColor="rgba(15, 122, 255, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={CheckCircleIcon}
            title="Tasa de Éxito"
            value={`${kpis.successRate}%`}
            subtitle="Payouts completados"
            color="#00D084"
            bgColor="rgba(0, 208, 132, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={AccountBalanceWalletIcon}
            title="Volumen Total"
            value={kpis.totalVolume}
            subtitle="Monto transferido"
            color="#FFB81C"
            bgColor="rgba(255, 184, 28, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={SpeedIcon}
            title="Latencia Promedio"
            value={kpis.avgLatency}
            subtitle="Tiempo de procesamiento"
            color="#FF6B6B"
            bgColor="rgba(255, 107, 107, 0.1)"
          />
        </Grid>
      </Grid>

      {/* Información de Proveedores */}
      <Grid container spacing={3} sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '40% 60%' } }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, mb: 3 }}>
              <SwapCallsIcon sx={{ color: '#0F7AFF', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Proveedores
              </Typography>
            </Box>
            <Box sx={{ space: 2 }}>
              {Array.from(new Set(payouts.map(p => p.provider))).map((provider, idx) => {
                const providerPayouts = payouts.filter(p => p.provider === provider);
                const percentage = ((providerPayouts.length / totalPayouts) * 100).toFixed(0);
                const providerSuccess = providerPayouts.filter(p => p.status === 'SUCCEEDED').length;
                const providerSuccessRate = ((providerSuccess / providerPayouts.length) * 100).toFixed(0);
                return (
                  <Box key={idx} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{provider}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F7AFF' }}>
                        {percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={parseInt(percentage)} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, mb: 3 }}>
              <SecurityIcon sx={{ color: '#00D084', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Estado de Seguridad
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ p: 4, backgroundColor: 'rgba(0, 208, 132, 0.1)', borderRadius: 2, height: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-around', alignItems: 'center', gap: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 2 }}>
                      Score Seguridad
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#00D084', mb: 1 }}>
                      {kpis.securityGrade}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                      ({kpis.securityScore}/100)
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: '80px', md: '1px' }, height: { xs: '1px', md: '80px' }, backgroundColor: 'rgba(0, 208, 132, 0.3)' }} />
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 2 }}>
                      Payouts Verificados
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#00D084', mb: 1 }}>
                      {succeeded}/{totalPayouts}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                      Transacciones exitosas
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(15, 122, 255, 0.1)', borderRadius: 2, border: '1px solid rgba(15, 122, 255, 0.3)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1, fontWeight: 600 }}>
                    Aporte al Score:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 0.5 }}>
                    • Tasa éxito: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.success}/60</span> pts
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 0.5 }}>
                    • Latencia/Timeouts: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.latency}/20</span> pts
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block' }}>
                    • Diversificación: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.diversification}/20</span> pts
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Payouts Recientes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Eventos de Payout Recientes
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
                <th>Payout ID</th>
                <th>Comercio</th>
                <th>Monto</th>
                <th>Proveedor</th>
                <th>País</th>
                <th>Estado</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {payouts.slice(0, 10).map((payout, idx) => (
                <tr key={idx}>
                  <td><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{payout.payout_id}</Typography></td>
                  <td><Typography variant="body2">{payout.merchant_id}</Typography></td>
                  <td><Typography variant="body2" sx={{ fontWeight: 600 }}>${payout.amount.toFixed(2)}</Typography></td>
                  <td><Typography variant="body2">{payout.provider}</Typography></td>
                  <td><Typography variant="body2" sx={{ fontWeight: 600 }}>{payout.country}</Typography></td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {payout.status === 'SUCCEEDED' ? (
                        <>
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#00D084' }} />
                          <Typography variant="body2">Exitoso</Typography>
                        </>
                      ) : (
                        <>
                          <ErrorIcon sx={{ fontSize: 18, color: '#FF3B30' }} />
                          <Typography variant="body2">Fallido</Typography>
                        </>
                      )}
                    </Box>
                  </td>
                  <td>
                    <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                      {payout.status === 'SUCCEEDED' 
                        ? `${payout.processing_time_sec || Math.round(payout.latency_ms / 1000)}s`
                        : payout.error_code
                      }
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
