import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, Chip, Icon, Button, Select, MenuItem, FormControl, TextField } from '@mui/material';
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
import errorRecommendations from '../constants/errorRecommendations.json';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fechas fijas
  const fromDate = '2025-12-13T08:00:00';
  const toDate = '2025-12-13T12:00:00';

  // Map error codes to known recommendation codes
  const mapErrorCode = (errorCode) => {
    const errorCodeMap = {
      'PROVIDER_TIMEOUT': 'PROVIDER_TIMEOUT',
      'PROVIDER_UNAVAILABLE': 'PROVIDER_UNAVAILABLE',
      'INSUFFICIENT_BALANCE': 'INSUFFICIENT_BALANCE',
      'INSUFFICIENT_FUNDS': 'INSUFFICIENT_BALANCE',
      'INVALID_ACCOUNT': 'INVALID_BENEFICIARY_DATA',
      'INVALID_BENEFICIARY_DATA': 'INVALID_BENEFICIARY_DATA',
      'INVALID_BANK_ACCOUNT': 'INVALID_BANK_ACCOUNT',
      'ACCOUNT_BLOCKED': 'ACCOUNT_BLOCKED',
      'ACCOUNT_CLOSED': 'ACCOUNT_CLOSED',
      'AUTHORIZATION_REQUIRED': 'AUTHORIZATION_REQUIRED',
      'AUTHORIZATION_EXPIRED': 'AUTHORIZATION_EXPIRED',
      'PROVIDER_DECLINED': 'PROVIDER_DECLINED',
      'RISK_BLOCKED': 'RISK_BLOCKED',
      'AML_REJECTED': 'AML_REJECTED',
      'SANCTIONS_MATCH': 'SANCTIONS_MATCH',
      'INTERNAL_PROCESSING_ERROR': 'INTERNAL_PROCESSING_ERROR',
      'RETRY_LIMIT_EXCEEDED': 'RETRY_LIMIT_EXCEEDED',
      'PAYOUT_LIMIT_EXCEEDED': 'PAYOUT_LIMIT_EXCEEDED',
      'DAILY_PAYOUT_LIMIT': 'DAILY_PAYOUT_LIMIT',
    };
    return errorCodeMap[errorCode] || null;
  };

  // Get recommendations from JSON based on error code
  const getRecommendation = (errorCode) => {
    const mappedCode = mapErrorCode(errorCode);
    if (mappedCode) {
      return errorRecommendations.errorRecommendations[mappedCode] || null;
    }
    return null;
  };

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = OVERVIEW_ENDPOINT(fromDate, toDate);
      const response = await apiClient.get(url);
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      setOverview(data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error loading backend data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Log the overview data to verify structure
  useEffect(() => {
    if (overview) {
      console.log('Overview data received:', overview);
      console.log('Total Events:', overview.totalEvents);
      console.log('Total Success:', overview.totalSuccess);
      console.log('Total Failed:', overview.totalFailed);
      console.log('Active Issues:', overview.activeIssues);
    }
  }, [overview]);

  // Create mock events from activeIssues data
  const mockEvents = (overview?.activeIssues || []).flatMap(issue => {
    return Array(issue.totalEvents || 0).fill(null).map((_, i) => {
      let status = 'SUCCEEDED';
      
      // Procesar el status de la API con nuestra lógica
      if (issue.status) {
        const apiStatus = issue.status?.trim()?.toUpperCase();
        
        // Si es aprobado o exitoso
        if (apiStatus === 'APPROVE' || apiStatus === 'APPROVED' || apiStatus === 'SUCCEED' || apiStatus === 'SUCCESS') {
          status = 'SUCCEEDED';
        } 
        // Si es fallido, revisar mainErrorCategory
        else if (apiStatus === 'FAILED' || apiStatus === 'FAIL') {
          const isCancelled = issue.mainErrorCategory?.trim()?.toUpperCase() === 'USER';
          status = isCancelled ? 'CANCELLED' : 'FAILED';
        } 
        else {
          status = apiStatus;
        }
      } else {
        // Fallback: si no hay status, generar basado en failedEvents
        if (i < (issue.failedEvents || 0)) {
          const isCancelled = issue.mainErrorCategory?.trim()?.toUpperCase() === 'USER';
          status = isCancelled ? 'CANCELLED' : 'FAILED';
        }
      }
      
      return {
        id: `${issue.merchantId}-${i}`,
        status: status,
        country: issue.countryCode,
        provider: issue.provider,
        amount: 100,
        merchant_id: issue.merchantId,
        merchantName: issue.merchantName,
        latencyMs: issue.avgLatencyMs,
        errorCode: issue.mainErrorType
      };
    });
  });

  // Obtener lista de países únicos desde los activeIssues
  const allCountries = Array.from(
    new Set((overview?.activeIssues || []).map(i => i.countryCode))
  ).filter(Boolean).sort();
  
  // Filtrar payins por país
  const payins = selectedCountry === 'ALL'
    ? mockEvents
    : mockEvents.filter(p => p.country === selectedCountry);
  
  // Filtrar activeIssues por país
  const filteredIssues = selectedCountry === 'ALL'
    ? (overview?.activeIssues || [])
    : (overview?.activeIssues || []).filter(i => i.countryCode === selectedCountry);

  // Calcular métricas basadas en el país seleccionado
  // Excluir fallos cancelados por usuario (mainErrorCategory === 'USER')
  const countryFailed = filteredIssues.reduce((sum, i) => {
    const isCancelled = i.mainErrorCategory === 'USER';
    return isCancelled ? sum : sum + (i.failedEvents || 0);
  }, 0);
  const countrySucceeded = filteredIssues.reduce((sum, i) => sum + (i.totalEvents - (i.failedEvents || 0)), 0);
  const countryTotalPayins = filteredIssues.reduce((sum, i) => sum + (i.totalEvents || 0), 0);
  const successRate = countryTotalPayins > 0 ? ((countrySucceeded / countryTotalPayins) * 100).toFixed(1) : '0.0';
  
  // Calculate total volume from successful transactions only (excluding failed/cancelled)
  const totalVolume = filteredIssues.reduce((sum, issue) => {
    const successfulEvents = (issue.totalEvents || 0) - (issue.failedEvents || 0);
    return sum + (successfulEvents * 100);
  }, 0);
  
  const avgLatency = filteredIssues.length > 0 
    ? (filteredIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / filteredIssues.length / 1000).toFixed(2)
    : '0.00';

  // Security Score basado en el país seleccionado
  const countrySecurityScore = countryTotalPayins > 0 
    ? Math.max(100 - ((countryFailed / countryTotalPayins) * 100), 0)
    : 100;

  const getSecurityGrade = (score) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    if (numScore >= 95) return 'A+';
    if (numScore >= 90) return 'A';
    if (numScore >= 80) return 'B+';
    if (numScore >= 70) return 'B';
    if (numScore >= 60) return 'C';
    return 'F';
  };

  // Mapear activeIssues a alertas con severity basado en impactLevel
  const mapIssuesToAlerts = () => {
    return (overview?.activeIssues || []).map(issue => ({
      id: `${issue.merchantId}-${issue.incidentTag}`,
      provider: issue.provider,
      severity: issue.impactLevel === 'high' ? 'critical' : issue.impactLevel === 'medium' ? 'warning' : 'info',
      errorCode: issue.incidentTag,
      errorMessage: issue.description,
      failureCount: issue.failedEvents || 0,
      failureRate: (issue.errorRate || 0).toFixed(1),
      totalImpact: issue.failedAmount || 0,
      actions: [
        `Merchant: ${issue.merchantName}`,
        `Country: ${issue.countryCode}`,
        `Payment Method: ${issue.paymentMethod}`,
        `Suggested Action: ${issue.suggestedActionType}`
      ],
      timestamp: issue.lastSeen
    }));
  };

  const alerts = mapIssuesToAlerts();

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography>Loading data...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', color: 'red' }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  const kpis = {
    totalPayins: countryTotalPayins,
    successRate: parseFloat(successRate),
    failedPayins: countryFailed,
    totalVolume: `$${(totalVolume / 1000).toFixed(1)}K`,
    avgLatency: `${avgLatency}s`,
    providers: Array.from(new Set(filteredIssues.map(i => i.provider))).length,
    securityScore: countrySecurityScore.toFixed(1),
    securityGrade: getSecurityGrade(countrySecurityScore),
    alertCount: alerts.filter(a => a.severity === 'critical').length
  };

  const securityFactors = {
    success: (countrySucceeded / countryTotalPayins * 60).toFixed(1) || '0', 
    latency: (20 - (parseFloat(avgLatency) / 2)).toFixed(1) || '15', 
    diversification: Array.from(new Set(filteredIssues.map(i => i.provider))).length * 3 > 20 ? '20' : (Array.from(new Set(filteredIssues.map(i => i.provider))).length * 3).toFixed(1)
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
              Payins Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
              Transfer Processing & Routing System • Real-time monitoring of merchant payments
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                Country
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  sx={{
                    backgroundColor: '#151B2E',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 1,
                    height: 40,
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
          </Box>
        </Box>
      </Box>

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
                const providerIssues = (overview?.activeIssues || []).filter(i => i.provider === provider);
                const percentage = countryTotalPayins > 0 ? ((providerPayins.length / countryTotalPayins) * 100).toFixed(0) : '0';
                const avgLatencyProvider = providerIssues.length > 0 
                  ? (providerIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / providerIssues.length).toFixed(0)
                  : 0;
                
                return (
                  <Box key={idx} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{provider}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F7AFF' }}>
                        {percentage}% | {avgLatencyProvider}ms
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
                      {countrySucceeded}/{countryTotalPayins}
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
                    • Success rate: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.success || '0'}/60</span> pts
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 0.5 }}>
                    • Latency/Timeouts: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.latency || '0'}/20</span> pts
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block' }}>
                    • Diversification: <span style={{ color: '#00D084', fontWeight: 600 }}>{securityFactors.diversification || '0'}/20</span> pts
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
                  <td><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{payin.id}</Typography></td>
                  <td><Typography variant="body2">{payin.merchantName || payin.merchant_id}</Typography></td>
                  <td><Typography variant="body2" sx={{ fontWeight: 600 }}>${(payin.amount || 0).toFixed(2)}</Typography></td>
                  <td><Typography variant="body2">{payin.provider}</Typography></td>
                  <td><Typography variant="body2" sx={{ fontWeight: 600 }}>{payin.country}</Typography></td>
                  <td>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {payin.status === 'SUCCEEDED' ? (
                        <>
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#00D084' }} />
                          <Typography variant="body2">Successful</Typography>
                        </>
                      ) : payin.status === 'CANCELLED' ? (
                        <Typography variant="body2">Cancelled</Typography>
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
                      {payin.latencyMs ? `${(payin.latencyMs / 1000).toFixed(2)}s` : 'N/A'}
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
