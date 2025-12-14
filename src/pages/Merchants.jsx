import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, FormControl, Select, MenuItem, Chip, Alert } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import { OVERVIEW_ENDPOINT, apiClient } from '../config/apiConfig';

const Merchants = () => {
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const from = '2025-12-13T08:00:00';
  const to = '2025-12-13T12:00:00';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = OVERVIEW_ENDPOINT(from, to);
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

  // Obtener lista de merchants únicos desde activeIssues
  const allMerchants = Array.from(
    new Set((overview?.activeIssues || []).map(i => i.merchantId))
  ).sort();

  // Obtener issues del merchant seleccionado
  const merchantIssues = selectedMerchant
    ? (overview?.activeIssues || []).filter(i => i.merchantId === selectedMerchant)
    : [];

  // Filtrar solo issues con fallos reales
  const merchantIssuesWithFailures = merchantIssues.filter(issue => 
    (issue.failedEvents || 0) > 0 || (issue.errorRate || 0) > 0
  );

  // Calcular KPIs del merchant
  const calculateMerchantMetrics = () => {
    if (merchantIssues.length === 0) {
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

    const totalEvents = merchantIssues.reduce((sum, i) => sum + (i.totalEvents || 0), 0);
    const totalFailed = merchantIssues.reduce((sum, i) => sum + (i.failedEvents || 0), 0);
    const totalSuccess = totalEvents - totalFailed;
    const successRate = totalEvents > 0 ? ((totalSuccess / totalEvents) * 100).toFixed(1) : '0.0';
    
    // Calculate total volume from merchant issues
    const volumeAmount = merchantIssues.reduce((sum, i) => sum + (i.totalEvents * 100), 0);
    const totalVolume = `$${(volumeAmount / 1000).toFixed(1)}K`;
    
    const avgLatency = merchantIssues.length > 0 
      ? (merchantIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / merchantIssues.length / 1000).toFixed(2)
      : '0.00';
    const failureRate = totalEvents > 0 ? ((totalFailed / totalEvents) * 100).toFixed(1) : '0.0';

    return {
      totalPayins: totalEvents,
      successRate: parseFloat(successRate),
      failedPayins: totalFailed,
      totalVolume: totalVolume,
      avgLatency: `${avgLatency}s`,
      successCount: totalSuccess,
      failureRate: parseFloat(failureRate)
    };
  };

  const metrics = calculateMerchantMetrics();

  // Analizar problemas por provider
  const getProviderStatus = () => {
    const status = {};
    merchantIssues.forEach(issue => {
      if (!status[issue.provider]) {
        status[issue.provider] = { 
          total: 0, 
          failed: 0, 
          errors: [],
          impactLevel: issue.impactLevel,
          latencyMs: issue.avgLatencyMs,
          merchantName: issue.merchantName,
          country: issue.countryCode
        };
      }
      status[issue.provider].total += issue.totalEvents || 0;
      status[issue.provider].failed += issue.failedEvents || 0;
      if (issue.mainErrorType) {
        status[issue.provider].errors.push(issue.incidentTag);
      }
    });
    return status;
  };

  const providerStatus = getProviderStatus();

  // Obtener proveedor más utilizado
  const getMostUsedProvider = () => {
    if (Object.keys(providerStatus).length === 0) return null;
    return Object.entries(providerStatus).reduce((prev, current) => 
      (prev[1].total > current[1].total) ? prev : current
    )[0];
  };

  const mostUsedProvider = getMostUsedProvider();
  const availableProviders = Object.keys(providerStatus).sort();

  // Ordenar providers por número de transacciones (de mayor a menor)
  const sortedProviders = Object.entries(providerStatus)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([provider]) => provider);

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
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Merchants
        </Typography>
        <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>
          List of merchants and their payment activity.
        </Typography>

        {/* Merchant Filter */}
        <FormControl sx={{ minWidth: 300 }}>
          <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
            Select Merchant
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
            <MenuItem value="">Select your business</MenuItem>
            {allMerchants.map(merchant => {
              const merchantName = (overview?.activeIssues || []).find(i => i.merchantId === merchant)?.merchantName;
              return (
                <MenuItem key={merchant} value={merchant}>
                  {merchantName || merchant}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      {/* Content */}
      {selectedMerchant ? (
        <Grid container spacing={3} sx={{ flex: 1, display: 'grid', gridTemplateRows: 'auto 1fr 1fr 1fr', gridAutoRows: 'auto' }}>
          {/* KPIs Grid - 4 columnas iguales en la primera fila */}
          <Grid item xs={12} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <MetricCard
              icon={TrendingUpIcon}
              title="Processed Payins"
              value={metrics.totalPayins}
              subtitle="Total in period"
              color="#0F7AFF"
              bgColor="rgba(15, 122, 255, 0.1)"
            />
            <MetricCard
              icon={CheckCircleIcon}
              title="Success Rate"
              value={`${metrics.successRate}%`}
              subtitle={`${metrics.successCount} successful`}
              color="#00D084"
              bgColor="rgba(0, 208, 132, 0.1)"
            />
            <MetricCard
              icon={AccountBalanceWalletIcon}
              title="Total Volume"
              value={metrics.totalVolume}
              subtitle="Transferred amount"
              color="#FFB81C"
              bgColor="rgba(255, 184, 28, 0.1)"
            />
            <MetricCard
              icon={SpeedIcon}
              title="Average Latency"
              value={metrics.avgLatency}
              subtitle="Processing time"
              color={metrics.avgLatency > '1s' ? '#FF9500' : '#00D084'}
              bgColor={metrics.avgLatency > '1s' ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0, 208, 132, 0.1)'}
            />
          </Grid>

          {/* What affects me? */}
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 3, backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                What affects me?
              </Typography>
              
              {metrics.failedPayins > 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You have <strong>{metrics.failedPayins}</strong> failed transactions ({metrics.failureRate}% failure rate)
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✓ All your transactions were processed successfully
                </Alert>
              )}

              <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 2, fontWeight: 600 }}>
                Active Providers: {Object.keys(providerStatus).join(', ') || 'N/A'}
              </Typography>

              {/* Provider status */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, flex: 1 }}>
                {Object.entries(providerStatus).map(([provider, pStatus]) => {
                  const failRate = pStatus.total > 0 ? ((pStatus.failed / pStatus.total) * 100).toFixed(1) : '0';
                  const isHealthy = pStatus.failed === 0;
                  const isMostUsed = provider === mostUsedProvider;

                  return (
                    <Box key={provider}>
                        <Paper sx={{
                          p: 2,
                          background: isHealthy ? 'rgba(0, 208, 132, 0.05)' : 'rgba(255, 59, 48, 0.05)',
                          border: `1px solid ${isHealthy ? 'rgba(0, 208, 132, 0.2)' : 'rgba(255, 59, 48, 0.2)'}`,
                          borderRadius: 1,
                          position: 'relative'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                              {provider}
                            </Typography>
                            <Chip
                              label={isHealthy ? '✓ Healthy' : '✗ Issues'}
                              size="small"
                              sx={{
                                background: isHealthy ? '#00D084' : '#FF3B30',
                                color: '#fff',
                                fontWeight: 700
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                            {pStatus.total} transactions • Failure rate: {failRate}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                            Latency: {(pStatus.latencyMs / 1000).toFixed(2)}s
                          </Typography>
                          {pStatus.failed > 0 && (
                            <Typography variant="caption" sx={{ color: '#FF9500', display: 'block' }}>
                              Issues: {[...new Set(pStatus.errors)].join(', ')}
                            </Typography>
                          )}
                        </Paper>
                    </Box>
                  );
                })}
              </Box>

              {/* Providers Summary */}
              <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(15, 122, 255, 0.1)', borderRadius: 2, border: '2px solid rgba(15, 122, 255, 0.4)', boxShadow: '0 4px 12px rgba(15, 122, 255, 0.15)' }}>
                <Typography variant="h6" sx={{ color: '#0F7AFF', fontWeight: 700, display: 'block', mb: 2 }}>
                  📊 Provider Summary
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {sortedProviders.length > 0 ? (
                    sortedProviders.map((provider, index) => (
                      <Box
                        key={provider}
                        sx={{
                          p: 2,
                          backgroundColor: index === 0 ? 'rgba(255, 184, 28, 0.15)' : 'rgba(0, 208, 132, 0.1)',
                          border: index === 0 ? '2px solid rgba(255, 184, 28, 0.4)' : '1px solid rgba(0, 208, 132, 0.3)',
                          borderRadius: 1.5,
                          minWidth: '160px',
                          textAlign: 'center',
                          position: 'relative',
                          flex: '0 1 auto'
                        }}
                      >
                        {index === 0 && (
                          <Box sx={{
                            position: 'absolute',
                            top: -10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#FFB81C',
                            color: '#000',
                            px: 1.5,
                            py: 0.3,
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            ⭐ Most Used
                          </Box>
                        )}
                        <Typography variant="body2" sx={{ color: index === 0 ? '#FFB81C' : '#00D084', fontWeight: 700, mb: 1.5, mt: index === 0 ? 1.5 : 0 }}>
                          {provider}
                        </Typography>
                        <Chip
                          label={`Transactions: ${providerStatus[provider].total}`}
                          size="small"
                          sx={{
                            backgroundColor: index === 0 ? '#FFB81C' : '#00D084',
                            color: index === 0 ? '#000' : '#fff',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="caption" sx={{ color: '#A0AEC0', fontStyle: 'italic' }}>
                      No providers available
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Should I do something? */}
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ p: 3, backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Should I do something?
              </Typography>

              {merchantIssuesWithFailures.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#A0AEC0', fontWeight: 600 }}>
                    Active Issues:
                  </Typography>
                  {merchantIssuesWithFailures.map((issue, index) => {
                    const severityColor = issue.impactLevel === 'high' ? '#FF3B30' : issue.impactLevel === 'medium' ? '#FF9500' : '#0F7AFF';
                    
                    return (
                      <Alert 
                        key={issue.incidentTag} 
                        severity={issue.impactLevel === 'high' ? 'error' : issue.impactLevel === 'medium' ? 'warning' : 'info'}
                        sx={{ mb: 0 }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                            {index + 1}. {issue.title}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            {issue.description}
                          </Typography>
                          <Box sx={{ mt: 1, pl: 2, borderLeft: `2px solid ${severityColor}` }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: severityColor }}>
                              Suggested Action:
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {issue.suggestedActionType}
                            </Typography>
                          </Box>
                        </Box>
                      </Alert>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, py: 4, px: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: '#00D084' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#00D084', textAlign: 'center' }}>
                    ✓ Everything is working perfectly!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#A0AEC0', textAlign: 'center' }}>
                    All transactions are processing smoothly. No issues detected. Keep regular monitoring.
                  </Typography>
                </Box>
              )}

              <Typography variant="caption" sx={{ color: '#A0AEC0', mt: 2 }}>
                Last update: {new Date().toLocaleTimeString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', mt: 2 }}>
          <Typography variant="body1" sx={{ color: '#A0AEC0' }}>
            Select your business to see the status
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Merchants;
