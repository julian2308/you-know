import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, FormControl, Select, MenuItem, TextField } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import { OVERVIEW_ENDPOINT, apiClient } from '../config/apiConfig';
import errorRecommendations from '../constants/errorRecommendations.json';

const Providers = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = OVERVIEW_ENDPOINT(fromDate, toDate);
        const data = await apiClient.get(url);
        setOverview(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Obtener lista de países únicos desde activeIssues
  const allCountries = Array.from(
    new Set((overview?.activeIssues || []).map(i => i.countryCode))
  ).filter(Boolean).sort();

  // Obtener providers para el país seleccionado
  const providersInCountry = selectedCountry
    ? Array.from(
        new Set(
          (overview?.activeIssues || [])
            .filter(i => i.countryCode === selectedCountry)
            .map(i => i.provider)
        )
      ).sort()
    : [];

  // Filtrar issues por país y provider
  const filteredIssues = selectedCountry && selectedProvider
    ? (overview?.activeIssues || []).filter(
        i => i.countryCode === selectedCountry && i.provider === selectedProvider
      )
    : [];

  // Crear mock events con status correcto (incluyendo CANCELLED para USER)
  const providerMockEvents = filteredIssues.flatMap(issue => {
    return Array(issue.totalEvents || 0).fill(null).map((_, i) => {
      let status = 'SUCCEEDED';
      
      if (issue.status) {
        const apiStatus = issue.status?.trim()?.toUpperCase();
        if (apiStatus === 'APPROVE' || apiStatus === 'APPROVED' || apiStatus === 'SUCCEED' || apiStatus === 'SUCCESS') {
          status = 'SUCCEEDED';
        } else if (apiStatus === 'FAILED' || apiStatus === 'FAIL') {
          const isCancelled = issue.mainErrorCategory?.trim()?.toUpperCase() === 'USER';
          status = isCancelled ? 'CANCELLED' : 'FAILED';
        } else {
          status = apiStatus;
        }
      } else {
        if (i < (issue.failedEvents || 0)) {
          const isCancelled = issue.mainErrorCategory?.trim()?.toUpperCase() === 'USER';
          status = isCancelled ? 'CANCELLED' : 'FAILED';
        }
      }
      
      return {
        id: `${issue.provider}-${i}`,
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

  // Calcular KPIs del provider
  const calculateProviderMetrics = () => {
    if (filteredIssues.length === 0) {
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

    const totalEvents = filteredIssues.reduce((sum, i) => sum + (i.totalEvents || 0), 0);
    // Excluir fallos cancelados por usuario (mainErrorCategory === 'USER')
    const totalFailed = filteredIssues.reduce((sum, i) => {
      const isCancelled = i.mainErrorCategory === 'USER';
      return isCancelled ? sum : sum + (i.failedEvents || 0);
    }, 0);
    const totalSuccess = totalEvents - totalFailed;
    const successRate = totalEvents > 0 ? ((totalSuccess / totalEvents) * 100).toFixed(1) : '0.0';
    const avgLatency = filteredIssues.length > 0 
      ? (filteredIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / filteredIssues.length / 1000).toFixed(2)
      : '0.00';
    const failureRate = totalEvents > 0 ? ((totalFailed / totalEvents) * 100).toFixed(1) : '0.0';

    return {
      totalPayins: totalEvents,
      successRate: parseFloat(successRate),
      failedPayins: totalFailed,
      totalVolume: '$0.0K',
      avgLatency: `${avgLatency}s`,
      successCount: totalSuccess,
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

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography>Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Providers
        </Typography>
        <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>
          List and status of all payment providers in the system.
        </Typography>

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' } }}>
          <FormControl sx={{ minWidth: 250 }}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
              Select Country
            </Typography>
            <Select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedProvider('');
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
              <MenuItem value="">Select a country</MenuItem>
              {allCountries.map(country => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 250 }} disabled={!selectedCountry}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
              Select Provider
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
              <MenuItem value="">Select a provider</MenuItem>
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
                title="Processed Payins"
                value={metrics.totalPayins}
                subtitle="Total in period"
                color="#0F7AFF"
                bgColor="rgba(15, 122, 255, 0.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={CheckCircleIcon}
                title="Success Rate"
                value={`${metrics.successRate}%`}
                subtitle={`${metrics.successCount} successful`}
                color="#00D084"
                bgColor="rgba(0, 208, 132, 0.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={AccountBalanceWalletIcon}
                title="Total Volume"
                value={metrics.totalVolume}
                subtitle="Transferred amount"
                color="#FFB81C"
                bgColor="rgba(255, 184, 28, 0.1)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                icon={SpeedIcon}
                title="Average Latency"
                value={metrics.avgLatency}
                subtitle="Processing time"
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
                  Provider Information: {selectedProvider}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: 'rgba(0, 208, 132, 0.1)', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                        Successful Payins
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#00D084' }}>
                        {metrics.successCount}/{metrics.totalPayins}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 2, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                        Failure Rate
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                        {metrics.failureRate}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Merchant Issues for this Provider */}
                {filteredIssues.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2, color: '#fff' }}>
                      Active Issues:
                    </Typography>
                    <Grid container spacing={2}>
                      {filteredIssues.map((issue, idx) => (
                        <Grid item xs={12} key={idx}>
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: 'rgba(255, 149, 0, 0.05)',
                            border: `1px solid rgba(255, 149, 0, 0.2)`,
                            borderRadius: 1
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                                {issue.merchantName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#FF9500', fontWeight: 600 }}>
                                {issue.incidentTag}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                              {issue.totalEvents} events • {issue.failedEvents} failed • Latency: {(issue.avgLatencyMs / 1000).toFixed(2)}s
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                              {issue.description}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="body1" sx={{ color: '#A0AEC0' }}>
            {!selectedCountry
              ? 'Select a country to start'
              : 'Select a provider to view analytics'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Providers;
