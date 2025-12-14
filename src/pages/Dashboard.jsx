import React, { useState, useEffect, useCallback } from 'react';
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
import { OVERVIEW_ENDPOINT, apiClient } from '../config/apiConfig';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fechas de ejemplo, puedes parametrizar
  const from = '2025-12-13T08:00:00';
  const to = '2025-12-13T12:00:00';

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = OVERVIEW_ENDPOINT(from, to);
      const data = await apiClient.get(url);
      setOverview(data);
    } catch (err) {
      setError('Error al cargar datos del backend');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Obtener lista de países únicos desde los eventos
  const allCountries = Array.from(new Set((overview?.events || []).map(p => p.country))).sort();
  // Filtrar payins por país
  const payins = selectedCountry === 'ALL'
    ? (overview?.events || [])
    : (overview?.events || []).filter(p => p.country === selectedCountry);
  const succeeded = payins.filter(p => p.status === 'SUCCEEDED').length;
  const failed = payins.filter(p => p.status === 'FAILED').length;
  const totalPayins = payins.length;
  const successRate = totalPayins > 0 ? ((succeeded / totalPayins) * 100).toFixed(1) : '0.0';
  const totalVolume = payins.reduce((sum, p) => sum + (p.amount || 0), 0);
  const avgLatency = totalPayins > 0 ? (payins.reduce((sum, p) => sum + (p.processing_time_sec || (p.latency_ms ? p.latency_ms / 1000 : 0)), 0) / totalPayins).toFixed(2) : '0.00';

  // Security Score y factores (puedes adaptar según tu lógica)
  const securityScore = overview?.securityScore || 100;
  const securityFactors = overview?.securityFactors || { success: 0, latency: 0, diversification: 0 };
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
    payins.forEach(payin => {
      if (payin.status === 'FAILED') {
        if (!providerErrors[payin.provider]) {
          providerErrors[payin.provider] = [];
        }
        providerErrors[payin.provider].push(payin);
      }
    });

    // Crear alertas basadas en errores
    Object.entries(providerErrors).forEach(([provider, failedPayins]) => {
      const failureRate = (failedPayins.length / payins.filter(p => p.provider === provider).length) * 100;
      const totalImpact = failedPayins.reduce((sum, p) => sum + p.amount, 0);

      // Determinar severidad basada en el score de seguridad y tasa de fallo
      let severity = 'info';
      if (securityScore < 60 || failureRate > 50) severity = 'critical';
      else if (failureRate > 25 || securityScore < 80) severity = 'warning';

      const errorType = failedPayins[0].error_code;
      const actions = [
        'Review detailed error logs',
        'Contact technical support'
      ];

      alerts.push({
        id: `${provider}-${Date.now()}`,
        provider,
        severity,
        errorCode: errorType,
        errorMessage: failedPayins[0].error_message,
        failureCount: failedPayins.length,
        failureRate: failureRate.toFixed(1),
        totalImpact,
        actions,
        affectedPayins: failedPayins
      });
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  };
  // Alertas desde el backend (incidents)
  const alerts = overview?.activeIssues || [];

  if (loading) {
    return <Box sx={{ p: 6, textAlign: 'center' }}><Typography>Cargando datos...</Typography></Box>;
  }
  if (error) {
    return <Box sx={{ p: 6, textAlign: 'center', color: 'red' }}><Typography>{error}</Typography></Box>;
  }

  const kpis = {
    totalPayins,
    successRate,
    totalVolume: `$${totalVolume.toFixed(2)}`,
    avgLatency: `${avgLatency}s`,
    securityScore,
    securityGrade: getSecurityGrade(securityScore),
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Payins Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
              Transfer Processing & Routing System • Real-time monitoring of merchant payments
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
              <MenuItem value="ALL">All countries</MenuItem>
              {allCountries.map(country => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
    <Box sx={{ p: 4, backgroundColor: '#0D1B2A', color: '#E2E8F0', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            sx={{ color: '#E2E8F0', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <MenuItem value="ALL">Todos los países</MenuItem>
            {allCountries.map((country) => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Quick Alerts Card (removed, now only in Topbar) */}

      {/* KPIs Grid */}
      <Grid container spacing={3} sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' } }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={TrendingUpIcon}
            title="Processed Payins"
            value={kpis.totalPayins}
            subtitle="Total in period"
            color="#0F7AFF"
            bgColor="rgba(15, 122, 255, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={CheckCircleIcon}
            title="Success Rate"
            value={`${kpis.successRate}%`}
            subtitle="Completed payins"
            color="#00D084"
            bgColor="rgba(0, 208, 132, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={AccountBalanceWalletIcon}
            title="Total Volume"
            value={kpis.totalVolume}
            subtitle="Transferred amount"
            color="#FFB81C"
            bgColor="rgba(255, 184, 28, 0.1)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            icon={SpeedIcon}
            title="Average Latency"
            value={kpis.avgLatency}
            subtitle="Processing time"
            color="#FF6B6B"
            bgColor="rgba(255, 107, 107, 0.1)"
          />
        </Grid>
      </Grid>

      {/* Providers Info */}
      <Grid container spacing={3} sx={{ mb: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '40% 58%' } }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, mb: 3 }}>
              <SwapCallsIcon sx={{ color: '#0F7AFF', fontSize: 28, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Providers
              </Typography>
            </Box>
            <Box sx={{ space: 2 }}>
              {Array.from(new Set(payins.map(p => p.provider))).map((provider, idx) => {
                const providerPayins = payins.filter(p => p.provider === provider);
                const percentage = ((providerPayins.length / totalPayins) * 100).toFixed(0);
                const providerSuccess = providerPayins.filter(p => p.status === 'SUCCEEDED').length;
                const providerSuccessRate = ((providerSuccess / providerPayins.length) * 100).toFixed(0);
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
                Security Status
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ p: 4, backgroundColor: 'rgba(0, 208, 132, 0.1)', borderRadius: 2, height: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-around', alignItems: 'center', gap: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 2 }}>
                      Security Score
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
                      Verified Payins
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#00D084', mb: 1 }}>
                      {succeeded}/{totalPayins}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                      Successful transactions
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ p: 2, backgroundColor: 'rgba(15, 122, 255, 0.1)', borderRadius: 2, border: '1px solid rgba(15, 122, 255, 0.3)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1, fontWeight: 600 }}>
                    Score Contribution:
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 0.5 }}>
                    • Success rate: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.success}/60</span> pts
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 0.5 }}>
                    • Latency/Timeouts: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.latency}/20</span> pts
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block' }}>
                    • Diversification: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.diversification}/20</span> pts
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Payins */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Recent Payin Events
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
                <th>Payin ID</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Provider</th>
                <th>Country</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {payins.slice(0, 10).map((payin, idx) => (
                <tr key={idx}>
                  <td><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{payin.payin_id}</Typography></td>
                  <td><Typography variant="body2">{payin.merchant_id}</Typography></td>
                  <td><Typography variant="body2" sx={{ fontWeight: 600 }}>${payin.amount.toFixed(2)}</Typography></td>
                  <td><Typography variant="body2">{payin.provider}</Typography></td>
                  <td><Typography variant="body2" sx={{ fontWeight: 600 }}>{payin.country}</Typography></td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {payin.status === 'SUCCEEDED' ? (
                        <>
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#00D084' }} />
                          <Typography variant="body2">Successful</Typography>
                        </>
                      ) : (
                        <>
                          <ErrorIcon sx={{ fontSize: 18, color: '#FF3B30' }} />
                          <Typography variant="body2">Failed</Typography>
                        </>
                      )}
                    </Box>
                  </td>
                  <td>
                    <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                      {payin.status === 'SUCCEEDED' 
                        ? `${payin.processing_time_sec || Math.round(payin.latency_ms / 1000)}s`
                        : payin.error_code
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
