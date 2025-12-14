import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, FormControl, Select, MenuItem, Chip, Alert, TextField, List, ListItem, ListItemIcon, ListItemText, Collapse, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { OVERVIEW_ENDPOINT, MERCHANT_DETAIL_ENDPOINT, ALL_MERCHANTS_ENDPOINT, apiClient } from '../config/apiConfig';
import errorRecommendations from '../constants/errorRecommendations.json';


const Merchants = () => {
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAlerts, setExpandedAlerts] = useState({});
  const [allMerchantsData, setAllMerchantsData] = useState(null);
  const [merchantsLoading, setMerchantsLoading] = useState(true);

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

  // Toggle expanded state for alert actions
  const toggleExpandAlert = (alertId) => {
    setExpandedAlerts(prev => ({
      ...prev,
      [alertId]: !prev[alertId]
    }));
  };
  
  // Obtener fecha actual UTC en formato YYYY-MM-DD
  const getTodayUTC = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };
  
  // Fecha opcional (vacía por defecto)
  const [selectedDate, setSelectedDate] = useState('');

  // Calcular fechas automáticamente en UTC
  const getDateRange = (dateString) => {
    if (!dateString) {
      // Si no hay fecha, usar rango muy amplio para ver todos los datos
      const fromDate = '1970-01-01T00:00:00';
      const toDate = '2099-12-31T23:59:59';
      return { fromDate, toDate };
    }
    
    // Parsear la fecha como UTC (agregando 'Z' al final)
    const date = new Date(`${dateString}T00:00:00Z`);
    const nextDay = new Date(date);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    
    const fromDate = `${dateString}T00:00:00`;
    const toDate = `${nextDay.toISOString().split('T')[0]}T00:00:00`;
    
    return { fromDate, toDate };
  };

  const { fromDate, toDate } = getDateRange(selectedDate);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = OVERVIEW_ENDPOINT(fromDate, toDate);
        const data = await apiClient.get(url);
        setOverview(data);
      } catch (err) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, selectedMerchant]);

  // Obtener datos de todos los merchants para los providers
  useEffect(() => {
    const fetchAllMerchants = async () => {
      try {
        setMerchantsLoading(true);
        const url = ALL_MERCHANTS_ENDPOINT();
        const data = await apiClient.get(url);
        setAllMerchantsData(data);
      } catch (err) {
        // Error handled silently
      } finally {
        setMerchantsLoading(false);
      }
    };

    fetchAllMerchants();
  }, []);

  // Filtrar los datos del overview para el merchant seleccionado
  const getMerchantData = () => {
    if (!selectedMerchant || !overview?.activeIssues || !allMerchantsData) {
      return null;
    }


    // Obtener el nombre del merchant desde allMerchantsData
    const merchantsList = Array.isArray(allMerchantsData) ? allMerchantsData : (allMerchantsData.merchants || []);
    const selectedMerchantData = merchantsList.find(m => m.merchantId === selectedMerchant);
    if (!selectedMerchantData) {
      return null;
    }
    // Filtrar los activeIssues para el merchant seleccionado por nombre
    const merchantIssues = overview.activeIssues.filter(issue => issue.merchantName === selectedMerchantData.merchantName);
    if (merchantIssues.length === 0) {
      return null;
    }

    // Construir el objeto merchantDetail con los datos filtrados
    // Excluir canceladas por usuario del conteo de fallos
    const totalFailed = merchantIssues.reduce((sum, i) => {
      const isCancelled = i.mainErrorCategory === 'USER';
      return isCancelled ? sum : sum + (i.failedEvents || 0);
    }, 0);
    
    const totalEvents = merchantIssues.reduce((sum, i) => sum + (i.totalEvents || 0), 0);
    const totalSuccess = totalEvents - totalFailed;
    
    return {
      merchantId: selectedMerchant,
      from: overview.from,
      to: overview.to,
      activeIssues: merchantIssues,
      totalEvents: totalEvents,
      totalSuccess: totalSuccess,
      totalFailed: totalFailed,
      avgLatencyMs: merchantIssues.length > 0 
        ? merchantIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / merchantIssues.length
        : 0,
    };
  };

  const merchantDetail = getMerchantData();

  // Crear mock events con status correcto (incluyendo CANCELLED para USER)
  const merchantMockEvents = (merchantDetail?.activeIssues || []).flatMap(issue => {
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

  // Obtener lista de merchants únicos desde allMerchantsData (independiente de la fecha)
  const allMerchants = (() => {
    if (!allMerchantsData) return [];
    const merchantsList = Array.isArray(allMerchantsData) ? allMerchantsData : (allMerchantsData.merchants || []);
    // Retornar los merchantIds de los datos del endpoint /api/merchants
    return merchantsList.map(m => m.merchantId).filter(Boolean).sort();
  })();

  // Obtener issues del merchant seleccionado
  // Intentar con 'activeIssues' primero, luego 'issues' como fallback
  const merchantIssues = merchantDetail?.activeIssues || merchantDetail?.issues || [];
  
  // Filtrar solo issues con fallos reales (excluyendo canceladas por usuario)
  const merchantIssuesWithFailures = merchantIssues.filter(issue => {
    const isCancelled = issue.mainErrorCategory === 'USER';
    const hasFailures = (issue.failedEvents || 0) > 0 || (issue.errorRate || 0) > 0;
    return hasFailures && !isCancelled;
  });

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

    // totalPayins = número de incidentes/issues (transacciones únicas con problema)
    // no el total de eventos (intentos)
    const totalPayins = merchantIssues.length;
    
    // Separar fallos reales de canceladas por usuario
    const totalFailed = merchantIssues.reduce((sum, i) => {
      const isCancelled = i.mainErrorCategory === 'USER';
      return isCancelled ? sum : 1; // Contar 1 por cada issue fallido (no por totalEvents)
    }, 0);
    
    const totalSuccess = totalPayins - totalFailed;
    const successRate = totalPayins > 0 ? ((totalSuccess / totalPayins) * 100).toFixed(1) : '0.0';
    
    // Calculate total volume from successful transactions only (excluding failed/cancelled)
    const volumeAmount = merchantIssues.reduce((sum, i) => {
      const successfulEvents = (i.totalEvents || 0) - (i.failedEvents || 0);
      return sum + (successfulEvents * 100);
    }, 0);
    const totalVolume = `$${(volumeAmount / 1000).toFixed(1)}K`;
    
    const avgLatency = merchantIssues.length > 0 
      ? (merchantIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / merchantIssues.length / 1000).toFixed(2)
      : '0.00';
    const failureRate = totalPayins > 0 ? ((totalFailed / totalPayins) * 100).toFixed(1) : '0.0';

    return {
      totalPayins: totalPayins,
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

    // Obtener todos los providers del merchant seleccionado desde allMerchantsData
    if (selectedMerchant && allMerchantsData) {
      // El endpoint puede devolver un array directo o un objeto con propiedad merchants
      const merchantsList = Array.isArray(allMerchantsData) ? allMerchantsData : (allMerchantsData.merchants || []);
      
      // Obtener el nombre del merchant del overview para hacer matching
      const selectedMerchantName = (overview?.activeIssues || []).find(i => i.merchantId === selectedMerchant)?.merchantName;
      
      const merchantData = merchantsList.find(m => m.merchantName === selectedMerchantName);
      
      if (merchantData && merchantData.providers) {
        merchantData.providers.forEach(provider => {
          const providerName = provider.provider;
          status[providerName] = {
            total: 0,
            failed: 0,
            latencyMs: 0,
            errors: []
          };
        });
      }
    }

    // Agregar/actualizar conteos de transacciones del merchant detail
    merchantIssues.forEach(issue => {
      if (!status[issue.provider]) {
        status[issue.provider] = { total: 0, failed: 0, errors: [], latencyMs: issue.avgLatencyMs };
      }
      // Contar 1 por cada issue (no por totalEvents que son los intentos)
      status[issue.provider].total += 1;
      
      // Excluir fallos cancelados por usuario (mainErrorCategory === 'USER')
      const isCancelled = issue.mainErrorCategory === 'USER';
      if (!isCancelled) {
        status[issue.provider].failed += 1; // Contar 1 por issue fallido, no por failedEvents
      }
      
      // Solo agregar error si no es cancelado por usuario
      if (issue.incidentTag && !isCancelled) status[issue.provider].errors.push(issue.incidentTag);
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

        {/* Merchant Filter and Date Range */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start', justifyContent: { md: 'space-between' } }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
              Select Merchant
            </Typography>
            <FormControl sx={{ minWidth: 250 }}>
              {merchantsLoading || loading ? (
                <Typography variant="body2" sx={{ color: '#A0AEC0', py: 2 }}>
                  Loading merchants...
                </Typography>
              ) : allMerchants.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#FF9500', py: 2 }}>
                  No merchants available
                </Typography>
              ) : (
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
                    // Obtener el nombre del merchant desde allMerchantsData
                    let merchantName = merchant;
                    
                    if (allMerchantsData) {
                      const merchantsList = Array.isArray(allMerchantsData) ? allMerchantsData : (allMerchantsData.merchants || []);
                      const merchantData = merchantsList.find(m => m.merchantId === merchant);
                      if (merchantData) {
                        merchantName = merchantData.merchantName;
                      }
                    }
                    
                    return (
                      <MenuItem key={merchant} value={merchant}>
                        {merchantName}
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            </FormControl>
          </Box>

          <Box sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', mb: 1, display: 'block' }}>
              Date
            </Typography>
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{
                width: 200,
                '& input': {
                  color: '#fff',
                  fontSize: '0.875rem',
                  padding: '10px'
                },
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.08)'
                }
              }}
            />
            <Typography variant="caption" sx={{ color: '#A0AEC0', mt: 1, display: 'block', fontSize: '0.75rem', fontStyle: 'italic' }}>
              {selectedDate 
                ? `Showing data for ${selectedDate} (00:00) to next day (00:00)`
                : 'Showing all historical data'
              }
            </Typography>
          </Box>
        </Box>
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
                  Provider Summary
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
                    const alertId = `${issue.incidentTag}-${issue.provider}`;
                    const isExpanded = expandedAlerts[alertId] || false;
                    const recommendation = getRecommendation(issue.incidentTag);
                    // Cada issue es una transacción fallida, totalEvents son los intentos de esa transacción
                    return (
                      <Box key={issue.incidentTag}>
                        <Alert 
                          severity={issue.impactLevel === 'high' ? 'error' : issue.impactLevel === 'medium' ? 'warning' : 'info'}
                          sx={{ mb: 0 }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                                {index + 1}. {issue.title}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                                1 failed transaction (with {issue.totalEvents} attempt{issue.totalEvents !== 1 ? 's' : ''})
                              </Typography>
                              {recommendation && (
                                <Box sx={{ mt: 1, pl: 2, borderLeft: `2px solid ${severityColor}` }}>
                                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: severityColor }}>
                                    Recommended Action:
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    {recommendation.whatToDo}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            {recommendation && (
                              <Button
                                size="small"
                                onClick={() => toggleExpandAlert(alertId)}
                                sx={{
                                  minWidth: 0,
                                  p: 0.5,
                                  ml: 1,
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s'
                                }}
                              >
                                <ExpandMoreIcon sx={{ fontSize: 18 }} />
                              </Button>
                            )}
                          </Box>
                        </Alert>
                        {isExpanded && recommendation && (
                          <Box sx={{ 
                            mt: 1, 
                            p: 2, 
                            background: 'rgba(0, 0, 0, 0.1)', 
                            borderRadius: '4px',
                            mb: 1,
                            display: 'flex',
                            gap: 2
                          }}>
                            <LightbulbIcon sx={{ fontSize: 24, color: '#FF9500', flexShrink: 0, mt: 0.5 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Steps to resolve:
                              </Typography>
                              <List sx={{ pl: 0, py: 0 }}>
                                {recommendation.actions.map((action, idx) => (
                                  <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      <Typography variant="caption" sx={{ fontWeight: 600, color: severityColor }}>
                                        {idx + 1}.
                                      </Typography>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={action}
                                      primaryTypographyProps={{ variant: 'caption' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #2D3748' }}>
                                <Typography variant="caption" sx={{ color: '#A0AEC0', fontSize: '11px' }}>
                                  <strong>Est. time:</strong> {recommendation.estimatedResolutionTime}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
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
