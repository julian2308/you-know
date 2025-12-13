import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, FormControl, Select, MenuItem } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import { mockData } from '../data/mockData';

const Providers = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');

  // Obtener lista de países únicos
  const allCountries = Array.from(new Set(mockData.payoutEvents.map(p => p.country))).sort();

  // Obtener providers para el país seleccionado
  const providersInCountry = selectedCountry
    ? Array.from(new Set(
        mockData.payoutEvents
          .filter(p => p.country === selectedCountry)
          .map(p => p.provider)
      )).sort()
    : [];

  // Filtrar payouts por país y provider
  const filteredPayouts = selectedCountry && selectedProvider
    ? mockData.payoutEvents.filter(
        p => p.country === selectedCountry && p.provider === selectedProvider
      )
    : [];

  // Calcular KPIs del provider
  const calculateProviderMetrics = () => {
    if (filteredPayouts.length === 0) {
      return {
        totalPayouts: 0,
        successRate: 0,
        failedPayouts: 0,
        totalVolume: '$0.0K',
        avgLatency: '0s',
        successCount: 0,
        failureRate: 0
      };
    }

    const succeeded = filteredPayouts.filter(p => p.status === 'SUCCEEDED').length;
    const failed = filteredPayouts.filter(p => p.status === 'FAILED').length;
    const total = filteredPayouts.length;
    const successRate = ((succeeded / total) * 100).toFixed(1);
    const totalVolume = filteredPayouts.reduce((sum, p) => sum + p.amount, 0);
    const avgLatency = (filteredPayouts.reduce((sum, p) => sum + (p.processing_time_sec || p.latency_ms / 1000), 0) / total).toFixed(2);
    const failureRate = ((failed / total) * 100).toFixed(1);

    return {
      totalPayouts: total,
      successRate: parseFloat(successRate),
      failedPayouts: failed,
      totalVolume: `$${(totalVolume / 1000).toFixed(1)}K`,
      avgLatency: `${avgLatency}s`,
      successCount: succeeded,
      failureRate: parseFloat(failureRate)
    };
  };

  const metrics = calculateProviderMetrics();

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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Analítica de Proveedores
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          <FormControl sx={{ minWidth: 250 }}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
              Seleccionar País
            </Typography>
            <Select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedProvider(''); // Reset provider cuando cambia país
              }}
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
              <MenuItem value="">Selecciona un país</MenuItem>
              {allCountries.map(country => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 250 }} disabled={!selectedCountry}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
              Seleccionar Provider
            </Typography>
            <Select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
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
              <MenuItem value="">Selecciona un provider</MenuItem>
              {providersInCountry.map(provider => (
                <MenuItem key={provider} value={provider}>{provider}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Contenido */}
      {selectedCountry && selectedProvider ? (
        <>
          {/* KPIs Grid */}
          <Grid container spacing={3} sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' } }}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={TrendingUpIcon}
                title="Payouts Procesados"
                value={metrics.totalPayouts}
                subtitle="Total en período"
                color="#0F7AFF"
                bgColor="rgba(15, 122, 255, 0.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={CheckCircleIcon}
                title="Tasa de Éxito"
                value={`${metrics.successRate}%`}
                subtitle={`${metrics.successCount} exitosos`}
                color="#00D084"
                bgColor="rgba(0, 208, 132, 0.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={AccountBalanceWalletIcon}
                title="Volumen Total"
                value={metrics.totalVolume}
                subtitle="Monto transferido"
                color="#FFB81C"
                bgColor="rgba(255, 184, 28, 0.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={SpeedIcon}
                title="Latencia Promedio"
                value={metrics.avgLatency}
                subtitle="Tiempo de procesamiento"
                color="#FF6B6B"
                bgColor="rgba(255, 107, 107, 0.1)"
              />
            </Grid>
          </Grid>

          {/* Información del Provider */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Información del Provider: {selectedProvider}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: 'rgba(0, 208, 132, 0.1)', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                        Payouts Exitosos
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#00D084' }}>
                        {metrics.successCount}/{metrics.totalPayouts}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                        Tasa de Fallos
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                        {metrics.failureRate}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="body1" sx={{ color: '#A0AEC0' }}>
            {!selectedCountry
              ? 'Selecciona un país para comenzar'
              : 'Selecciona un provider para ver la analítica'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Providers;
