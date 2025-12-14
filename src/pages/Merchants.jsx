import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, FormControl, Select, MenuItem, Chip, Alert } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import { mockData } from '../data/mockData';
import errorRecommendations from '../constants/errorRecommendations.json';

const Merchants = () => {
  const [selectedMerchant, setSelectedMerchant] = useState('');

  // Obtener lista de merchants únicos
  const allMerchants = Array.from(new Set(mockData.payinEvents.map(p => p.merchant_id))).sort();

  // Obtener providers usados por el merchant seleccionado
  const merchantProviders = selectedMerchant
    ? Array.from(new Set(
        mockData.payinEvents
          .filter(p => p.merchant_id === selectedMerchant)
          .map(p => p.provider)
      )).sort()
    : [];

  // Filtrar payins del merchant seleccionado
  const merchantPayins = selectedMerchant
    ? mockData.payinEvents.filter(p => p.merchant_id === selectedMerchant)
    : [];

  // Calcular KPIs del merchant
  const calculateMerchantMetrics = () => {
    if (merchantPayins.length === 0) {
      return {
        totalPayins: 0,
        successRate: 0,
        failedPayins: 0,
        totalVolume: '$0.0K',
        avgLatency: '0s',
        successCount: 0,
        failureRate: 0
      };
    }

    const succeeded = merchantPayins.filter(p => p.status === 'SUCCEEDED').length;
    const failed = merchantPayins.filter(p => p.status === 'FAILED').length;
    const total = merchantPayins.length;
    const successRate = ((succeeded / total) * 100).toFixed(1);
    const totalVolume = merchantPayins.reduce((sum, p) => sum + p.amount, 0);
    const avgLatency = (merchantPayins.reduce((sum, p) => sum + (p.processing_time_sec || p.latency_ms / 1000), 0) / total).toFixed(2);
    const failureRate = ((failed / total) * 100).toFixed(1);

    return {
      totalPayins: total,
      successRate: parseFloat(successRate),
      failedPayins: failed,
      totalVolume: `$${(totalVolume / 1000).toFixed(1)}K`,
      avgLatency: `${avgLatency}s`,
      successCount: succeeded,
      failureRate: parseFloat(failureRate)
    };
  };

  const metrics = calculateMerchantMetrics();

  // Analizar problemas por provider
  const getProviderStatus = () => {
    const status = {};
    merchantPayins.forEach(payin => {
      if (!status[payin.provider]) {
        status[payin.provider] = { total: 0, failed: 0, errors: [] };
      }
      status[payin.provider].total++;
      if (payin.status === 'FAILED') {
        status[payin.provider].failed++;
        status[payin.provider].errors.push(payin.error_code);
      }
    });
    return status;
  };

  const providerStatus = getProviderStatus();

  // Obtener los 5 errores más comunes
  const getTopErrors = () => {
    const errorCounts = {};
    merchantPayins
      .filter(p => p.status === 'FAILED' && p.error_code)
      .forEach(payin => {
        errorCounts[payin.error_code] = (errorCounts[payin.error_code] || 0) + 1;
      });
    
    return Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({
        code,
        count,
        recommendation: errorRecommendations.errorRecommendations[code]
      }))
      .filter(item => item.recommendation);
  };

  const topErrors = getTopErrors();

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
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Mi Negocio
        </Typography>

        {/* Filtro de Merchant */}
        <FormControl sx={{ minWidth: 300 }}>
          <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
            Seleccionar Merchant
          </Typography>
          <Select
            value={selectedMerchant}
            onChange={(e) => setSelectedMerchant(e.target.value)}
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
            <MenuItem value="">Selecciona tu negocio</MenuItem>
            {allMerchants.map(merchant => (
              <MenuItem key={merchant} value={merchant}>{merchant}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Contenido */}
      {selectedMerchant ? (
        <Grid container spacing={3} sx={{ flex: 1, display: 'grid', gridTemplateRows: 'auto 1fr 1fr 1fr', gridAutoRows: 'auto' }}>
          {/* KPIs Grid - 4 columnas iguales en la primera fila */}
          <Grid item xs={12} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <MetricCard
              icon={TrendingUpIcon}
              title="Payins Procesados"
              value={metrics.totalPayins}
              subtitle="Total en período"
              color="#0F7AFF"
              bgColor="rgba(15, 122, 255, 0.1)"
            />
            <MetricCard
              icon={CheckCircleIcon}
              title="Tasa de Éxito"
              value={`${metrics.successRate}%`}
              subtitle={`${metrics.successCount} exitosos`}
              color="#00D084"
              bgColor="rgba(0, 208, 132, 0.1)"
            />
            <MetricCard
              icon={AccountBalanceWalletIcon}
              title="Volumen Total"
              value={metrics.totalVolume}
              subtitle="Monto transferido"
              color="#FFB81C"
              bgColor="rgba(255, 184, 28, 0.1)"
            />
            <MetricCard
              icon={SpeedIcon}
              title="Latencia Promedio"
              value={metrics.avgLatency}
              subtitle="Tiempo de procesamiento"
              color={metrics.avgLatency > 1 ? '#FF9500' : '#00D084'}
              bgColor={metrics.avgLatency > 1 ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0, 208, 132, 0.1)'}
            />
          </Grid>

          {/* ¿Qué me afecta? */}
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 3, backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                ¿Qué me afecta?
              </Typography>
              
              {metrics.failedPayins > 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Tienes <strong>{metrics.failedPayins}</strong> transacciones fallidas ({metrics.failureRate}% de tasa de fallo)
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✓ Todas tus transacciones se procesaron correctamente
                </Alert>
              )}

              <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 2, fontWeight: 600 }}>
                Providers disponibles: {merchantProviders.join(', ')}
              </Typography>

              {/* Estado por provider */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, flex: 1 }}>
                {merchantProviders.map(provider => {
                  const pStatus = providerStatus[provider];
                  const failRate = ((pStatus.failed / pStatus.total) * 100).toFixed(1);
                  const isHealthy = pStatus.failed === 0;

                  return (
                    <Box key={provider}>
                        <Paper sx={{
                          p: 2,
                          background: isHealthy ? 'rgba(0, 208, 132, 0.05)' : 'rgba(255, 59, 48, 0.05)',
                          border: `1px solid ${isHealthy ? 'rgba(0, 208, 132, 0.2)' : 'rgba(255, 59, 48, 0.2)'}`,
                          borderRadius: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                              {provider}
                            </Typography>
                            <Chip
                              label={isHealthy ? '✓ Sano' : '✗ Problemas'}
                              size="small"
                              sx={{
                                background: isHealthy ? '#00D084' : '#FF3B30',
                                color: '#fff',
                                fontWeight: 700
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                            {pStatus.total} transacciones • Tasa de fallo: {failRate}%
                          </Typography>
                          {pStatus.failed > 0 && (
                            <Typography variant="caption" sx={{ color: '#FF9500', display: 'block' }}>
                              Errores: {[...new Set(pStatus.errors)].join(', ')}
                            </Typography>
                          )}
                        </Paper>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          {/* ¿Debo hacer algo? */}
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 3, backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                ¿Debo hacer algo?
              </Typography>

              {topErrors.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#A0AEC0', fontWeight: 600 }}>
                    Top {topErrors.length} errores más comunes:
                  </Typography>
                  {topErrors.map((error, index) => {
                    const severity = error.recommendation.severity;
                    const severityConfig = errorRecommendations.severityLevels[severity];
                    
                    return (
                      <Alert 
                        key={error.code} 
                        severity={severity === 'critical' ? 'error' : severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'info'}
                        sx={{ 
                          mb: 0,
                          backgroundColor: `${severityConfig.color}15`,
                          borderColor: `${severityConfig.color}40`,
                          '& .MuiAlert-message': {
                            width: '100%'
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                            {index + 1}. {error.recommendation.title} ({error.count} ocurrencias)
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'inherit', opacity: 0.9 }}>
                            {error.recommendation.userMessage}
                          </Typography>
                          <Box sx={{ mt: 1, pl: 2, borderLeft: `2px solid ${severityConfig.color}` }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: severityConfig.color }}>
                              Qué hacer:
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'inherit', fontStyle: 'italic' }}>
                              {error.recommendation.whatToDo}
                            </Typography>
                          </Box>
                        </Box>
                      </Alert>
                    );
                  })}
                </Box>
              ) : metrics.failureRate > 0 ? (
                <Alert severity="info" sx={{ mb: 0 }}>
                  ℹ️ Tienes transacciones fallidas pero sin detalles de error disponibles.
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 0 }}>
                  ✓ Excelente. Todas tus transacciones se procesaron correctamente. Mantén monitoreo regular.
                </Alert>
              )}

              <Typography variant="caption" sx={{ color: '#A0AEC0', mt: 2 }}>
                Última actualización: {new Date().toLocaleTimeString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', mt: 2 }}>
          <Typography variant="body1" sx={{ color: '#A0AEC0' }}>
            Selecciona tu negocio para ver el estado
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Merchants;
