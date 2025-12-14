import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, FormControl, Select, MenuItem, Chip, Alert, TextField, List, ListItem, ListItemIcon, ListItemText, Collapse, Button } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SpeedIcon from '@mui/icons-material/Speed';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useOverview } from '../hooks/useOverview';
import { useMerchantsData } from '../hooks/useMerchantsData';
import errorRecommendations from '../constants/errorRecommendations.json';


const Merchants = () => {
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [expandedAlerts, setExpandedAlerts] = useState({});
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

  // Usar React Query para overview
  const { data: overview, isLoading: loading } = useOverview(fromDate, toDate);
  
  // Usar React Query para merchants
  const { data: allMerchantsData, isLoading: merchantsLoading } = useMerchantsData();

  // Map error codes to known recommendation codes
  const mapErrorCode = (errorCode) => {
    if (!errorCode) return null;
    
    // Normalize the error code: uppercase and remove special characters
    const normalized = errorCode.trim().toUpperCase().replace(/[\s\-]/g, '_');
    
    const errorCodeMap = {
      'PROVIDER_TIMEOUT': 'PROVIDER_TIMEOUT',
      'RESPONSE_TIME_EXCEEDED': 'PROVIDER_TIMEOUT',
      'BANK_TIMEOUT': 'PROVIDER_TIMEOUT',
      'TIMEOUT': 'PROVIDER_TIMEOUT',
      'PROVIDER_UNAVAILABLE': 'PROVIDER_UNAVAILABLE',
      'BANK_SERVICE_NOT_AVAILABLE': 'PROVIDER_UNAVAILABLE',
      'UNAVAILABLE': 'PROVIDER_UNAVAILABLE',
      'INSUFFICIENT_BALANCE': 'INSUFFICIENT_BALANCE',
      'INSUFFICIENT_FUNDS': 'INSUFFICIENT_BALANCE',
      'INSUFFICIENT': 'INSUFFICIENT_BALANCE',
      'INVALID_ACCOUNT': 'INVALID_BENEFICIARY_DATA',
      'INVALID_BENEFICIARY_DATA': 'INVALID_BENEFICIARY_DATA',
      'INCORRECT_RECIPIENT_DATA': 'INVALID_BENEFICIARY_DATA',
      'INVALID_DATA': 'INVALID_BENEFICIARY_DATA',
      'INVALID_BANK_ACCOUNT': 'INVALID_BANK_ACCOUNT',
      'ACCOUNT_BLOCKED': 'ACCOUNT_BLOCKED',
      'BLOCKED_ACCOUNT': 'ACCOUNT_BLOCKED',
      'BLOCKED': 'ACCOUNT_BLOCKED',
      'ACCOUNT_CLOSED': 'ACCOUNT_CLOSED',
      'BANK_ACCOUNT_CLOSED': 'ACCOUNT_CLOSED',
      'CLOSED': 'ACCOUNT_CLOSED',
      'AUTHORIZATION_REQUIRED': 'AUTHORIZATION_REQUIRED',
      'SECURITY_CONFIRMATION_REQUIRED': 'AUTHORIZATION_REQUIRED',
      'AUTHORIZATION_EXPIRED': 'AUTHORIZATION_EXPIRED',
      'CONFIRMATION_EXPIRED': 'AUTHORIZATION_EXPIRED',
      'EXPIRED': 'AUTHORIZATION_EXPIRED',
      'PROVIDER_DECLINED': 'PROVIDER_DECLINED',
      'BANK_REJECTION': 'PROVIDER_DECLINED',
      'DECLINED': 'PROVIDER_DECLINED',
      'REJECTION': 'PROVIDER_DECLINED',
      'RISK_BLOCKED': 'RISK_BLOCKED',
      'SECURITY_BLOCK': 'RISK_BLOCKED',
      'RISK': 'RISK_BLOCKED',
      'AML_REJECTED': 'AML_REJECTED',
      'REGULATORY_REJECTION': 'AML_REJECTED',
      'AML': 'AML_REJECTED',
      'SANCTIONS_MATCH': 'SANCTIONS_MATCH',
      'LEGAL_VALIDATION_REQUIRED': 'SANCTIONS_MATCH',
      'SANCTIONS': 'SANCTIONS_MATCH',
      'INTERNAL_PROCESSING_ERROR': 'INTERNAL_PROCESSING_ERROR',
      'PROCESSING_ERROR': 'INTERNAL_PROCESSING_ERROR',
      'ERROR': 'INTERNAL_PROCESSING_ERROR',
      'RETRY_LIMIT_EXCEEDED': 'RETRY_LIMIT_EXCEEDED',
      'TOO_MANY_FAILED_ATTEMPTS': 'RETRY_LIMIT_EXCEEDED',
      'RETRY_LIMIT': 'RETRY_LIMIT_EXCEEDED',
      'PAYOUT_LIMIT_EXCEEDED': 'PAYOUT_LIMIT_EXCEEDED',
      'TRANSACTION_LIMIT_EXCEEDED': 'PAYOUT_LIMIT_EXCEEDED',
      'LIMIT_EXCEEDED': 'PAYOUT_LIMIT_EXCEEDED',
      'DAILY_PAYOUT_LIMIT': 'DAILY_PAYOUT_LIMIT',
      'DAILY_LIMIT_REACHED': 'DAILY_PAYOUT_LIMIT',
      'DAILY_LIMIT': 'DAILY_PAYOUT_LIMIT',
    };
    
    // First try exact match
    if (errorCodeMap[normalized]) {
      return errorCodeMap[normalized];
    }
    
    // If no exact match, try to find by pattern (search for keywords within the code)
    // E.g., MX_STRIPE_TIMEOUT contains TIMEOUT
    for (const [key, value] of Object.entries(errorCodeMap)) {
      if (normalized.includes(key) && key.length > 3) {
        return value;
      }
    }
    
    return null;
  };

  // Get recommendations from JSON based on error code
  const getRecommendation = (errorCode, mainErrorCategory, totalEvents, mainErrorType) => {
    const normalizedErrorCode = errorCode?.toUpperCase()?.trim() || '';
    const normalizedMainErrorType = mainErrorType?.toLowerCase()?.trim();
    const normalizedMainErrorCategory = mainErrorCategory?.trim()?.toUpperCase();
    
    // Check if this is a timeout error (primary check: error code name contains TIMEOUT)
    const isTimeoutByName = normalizedErrorCode.includes('TIMEOUT');
    const isTimeoutByType = normalizedMainErrorType === 'timeout';
    const isTimeoutByMapping = mapErrorCode(errorCode) === 'PROVIDER_TIMEOUT';
    
    const isTimeoutError = isTimeoutByName || isTimeoutByType || isTimeoutByMapping;
    
    // Apply attempt-based logic for ANY timeout from a PROVIDER
    if (isTimeoutError && normalizedMainErrorCategory === 'PROVIDER') {
      // If multiple attempts, provider is having issues
      if (totalEvents && totalEvents > 1) {
        return errorRecommendations.errorCategoryRecommendations['PROVIDER_TIMEOUT_MULTIPLE_ATTEMPTS'] || 
               errorRecommendations.errorCategoryRecommendations['PROVIDER'];
      }
      // If single or no attempt info, first attempt - recommend retries
      else {
        return errorRecommendations.errorCategoryRecommendations['PROVIDER_TIMEOUT_SINGLE_ATTEMPT'] || 
               errorRecommendations.errorRecommendations['PROVIDER_TIMEOUT'];
      }
    }
    
    // For non-timeout PROVIDER errors, use generic provider recommendation
    if (!isTimeoutError && normalizedMainErrorCategory === 'PROVIDER') {
      return errorRecommendations.errorCategoryRecommendations['PROVIDER'];
    }
    
    // For other categories (MERCHANT, USER, etc.)
    if (normalizedMainErrorCategory) {
      if (errorRecommendations.errorCategoryRecommendations?.[normalizedMainErrorCategory]) {
        return errorRecommendations.errorCategoryRecommendations[normalizedMainErrorCategory];
      }
    }
    
    // Fall back to error-specific recommendations
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

  // Filtrar los datos del overview para el merchant seleccionado
  const getMerchantData = () => {
    // Crear objeto vacío por defecto para evitar null
    const emptyMerchant = {
      merchantId: selectedMerchant,
      from: overview?.from,
      to: overview?.to,
      activeIssues: [],
      totalEvents: 0,
      totalApproved: 0,
      totalSuccess: 0,
      totalFailed: 0,
      avgLatencyMs: 0,
    };

    if (!selectedMerchant) {
      return null;
    }

    if (!allMerchantsData) {
      return emptyMerchant;
    }

    // Obtener el nombre del merchant desde allMerchantsData
    const merchantsList = Array.isArray(allMerchantsData) ? allMerchantsData : (allMerchantsData.merchants || []);
    const selectedMerchantData = merchantsList.find(m => m.merchantId === selectedMerchant);
    
    if (!selectedMerchantData) {
      return emptyMerchant;
    }

    // Si overview aún está cargando, retornar objeto vacío válido
    if (!overview?.activeIssues) {
      return emptyMerchant;
    }

    // Filtrar los activeIssues para el merchant seleccionado por nombre
    const merchantIssues = overview.activeIssues.filter(issue => issue.merchantName === selectedMerchantData.merchantName);
    
    // Si no hay issues, retornar un objeto vacío pero válido
    if (merchantIssues.length === 0) {
      return emptyMerchant;
    }

    // Construir el objeto merchantDetail con los datos filtrados
    // Excluir canceladas por usuario del conteo de fallos
    let totalFailed = 0;
    let totalApproved = 0;
    
    merchantIssues.forEach(i => {
      const isCancelled = i.mainErrorCategory === 'USER';
      if (!isCancelled) {
        // failedEvents represents the count of failed transactions/attempts
        totalFailed += (i.failedEvents || 0);
      }
      // Approved events = total events minus failed events
      totalApproved += ((i.totalEvents || 0) - (i.failedEvents || 0));
    });
    
    const totalEvents = totalApproved + totalFailed;
    
    return {
      merchantId: selectedMerchant,
      from: overview.from,
      to: overview.to,
      activeIssues: merchantIssues,
      totalEvents: totalEvents,
      totalApproved: totalApproved,
      totalSuccess: totalApproved,
      totalFailed: totalFailed,
      avgLatencyMs: merchantIssues.length > 0 
        ? merchantIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / merchantIssues.length
        : 0,
    };
  };

  const merchantDetail = getMerchantData();

  // Protección adicional: si merchantDetail es null pero hay un merchant seleccionado, crear objeto vacío
  const safeMerchantDetail = merchantDetail || (selectedMerchant ? {
    merchantId: selectedMerchant,
    from: overview?.from,
    to: overview?.to,
    activeIssues: [],
    totalEvents: 0,
    totalApproved: 0,
    totalSuccess: 0,
    totalFailed: 0,
    avgLatencyMs: 0,
  } : null);

  // Crear mock events con status correcto (incluyendo CANCELLED para USER)
  const merchantMockEvents = (safeMerchantDetail?.activeIssues || []).flatMap(issue => {
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
  const merchantIssues = safeMerchantDetail?.activeIssues || safeMerchantDetail?.issues || [];
  
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
        failureRate: 0,
        totalAttempts: 0,
        approvedAttempts: 0
      };
    }

    // Calculate metrics based on total attempts/events, not just issues
    // totalEvents = total attempts, failedEvents = failed attempts
    let totalAttempts = 0;
    let totalFailedAttempts = 0;
    let userCancelledAttempts = 0;
    
    merchantIssues.forEach(i => {
      const isCancelled = i.mainErrorCategory === 'USER';
      totalAttempts += (i.totalEvents || 0);
      
      if (isCancelled) {
        userCancelledAttempts += (i.failedEvents || 0);
      } else {
        totalFailedAttempts += (i.failedEvents || 0);
      }
    });
    
    // Approved attempts = total - failed (excluding user cancellations)
    const approvedAttempts = totalAttempts - totalFailedAttempts - userCancelledAttempts;
    
    // Success rate = approved / (total - user_cancelled)
    const totalValidAttempts = totalAttempts - userCancelledAttempts;
    const successRate = totalValidAttempts > 0 ? ((approvedAttempts / totalValidAttempts) * 100).toFixed(1) : '0.0';
    
    // Calculate failure rate
    const failureRate = totalValidAttempts > 0 ? ((totalFailedAttempts / totalValidAttempts) * 100).toFixed(1) : '0.0';
    
    // Count of failed transactions (issues)
    const totalPayins = merchantIssues.length;
    const totalFailed = merchantIssues.filter(i => i.mainErrorCategory !== 'USER').length;
    
    // Calculate total volume (assuming $100 per successful attempt)
    const volumeAmount = approvedAttempts * 100;
    const totalVolume = `$${(volumeAmount / 1000).toFixed(1)}K`;
    
    const avgLatency = merchantIssues.length > 0 
      ? (merchantIssues.reduce((sum, i) => sum + (i.avgLatencyMs || 0), 0) / merchantIssues.length / 1000).toFixed(2)
      : '0.00';

    return {
      totalPayins: totalPayins,
      successRate: parseFloat(successRate),
      failedPayins: totalFailed,
      totalVolume: totalVolume,
      avgLatency: `${avgLatency}s`,
      successCount: approvedAttempts,
      failureRate: parseFloat(failureRate),
      totalAttempts: totalAttempts,
      approvedAttempts: approvedAttempts
    };
  };

  const metrics = calculateMerchantMetrics();

  // Analizar problemas por provider
  const getProviderStatus = () => {
    const status = {};

    // Obtener todos los providers del merchant seleccionado desde allMerchantsData
    if (selectedMerchant && allMerchantsData) {
      try {
        // El endpoint puede devolver un array directo o un objeto con propiedad merchants
        const merchantsList = Array.isArray(allMerchantsData) ? allMerchantsData : (allMerchantsData.merchants || []);
        
        console.log('=== PROVIDER LOOKUP DEBUG ===');
        console.log('All merchants data received:', allMerchantsData);
        console.log('Merchants list:', merchantsList);
        console.log('Merchants list length:', merchantsList.length);
        
        // Obtener el nombre del merchant del overview para hacer matching
        const selectedMerchantName = (overview?.activeIssues || []).find(i => i.merchantId === selectedMerchant)?.merchantName;
        
        console.log('Selected merchant ID:', selectedMerchant);
        console.log('Selected merchant name:', selectedMerchantName);
        console.log('Available merchant names in API:', merchantsList.map(m => m.merchantName || m.name || m.id));
        
        // Try to find merchant by name, with case-insensitive matching as fallback
        let merchantData = merchantsList.find(m => m.merchantName === selectedMerchantName);
        
        if (!merchantData && selectedMerchantName) {
          // Fallback: case-insensitive match
          merchantData = merchantsList.find(m => 
            (m.merchantName || '').toLowerCase() === selectedMerchantName.toLowerCase()
          );
        }
        
        if (!merchantData && merchantsList.length > 0) {
          // Another fallback: try matching by ID
          merchantData = merchantsList.find(m => m.merchantId === selectedMerchant || m.id === selectedMerchant);
        }
        
        console.log('Merchant data found:', merchantData);
        
        if (merchantData) {
          // Handle different possible provider property structures
          const providersList = merchantData.providers || merchantData.paymentProviders || merchantData.payment_providers || [];
          
          console.log('Providers list from API:', providersList);
          console.log('Providers list type:', typeof providersList);
          console.log('Providers list is array:', Array.isArray(providersList));
          
          if (Array.isArray(providersList) && providersList.length > 0) {
            providersList.forEach(provider => {
              // Provider can be an object with 'provider' property or just a string
              let providerName = null;
              
              if (typeof provider === 'string') {
                providerName = provider;
              } else if (typeof provider === 'object' && provider !== null) {
                providerName = provider.provider || provider.name || provider.id || provider.providerName;
              }
              
              if (providerName) {
                status[providerName] = {
                  total: 0,
                  failed: 0,
                  latencyMs: 0,
                  errors: []
                };
                console.log('✓ Initialized provider:', providerName);
              }
            });
          } else {
            console.warn('Providers list is empty or not an array');
          }
        } else {
          console.warn('Merchant data not found for selected merchant:', selectedMerchantName);
          if (merchantsList.length > 0) {
            console.log('First merchant in list:', merchantsList[0]);
          }
        }
      } catch (error) {
        console.error('Error processing providers:', error);
      }
    } else {
      console.log('=== PROVIDER LOOKUP SKIPPED ===');
      console.log('selectedMerchant:', selectedMerchant);
      console.log('allMerchantsData:', allMerchantsData);
    }

    // Agregar/actualizar conteos de transacciones del merchant detail
    merchantIssues.forEach(issue => {
      if (!status[issue.provider]) {
        status[issue.provider] = { total: 0, failed: 0, errors: [], latencyMs: issue.avgLatencyMs };
      }
      // Contar totalEvents (intentos totales) en lugar de 1 issue
      status[issue.provider].total += issue.totalEvents || 0;
      
      // Excluir fallos cancelados por usuario (mainErrorCategory === 'USER')
      const isCancelled = issue.mainErrorCategory === 'USER';
      if (!isCancelled) {
        // Contar failedEvents (intentos fallidos) en lugar de 1 issue
        status[issue.provider].failed += issue.failedEvents || 0;
      }
      
      // Actualizar latency
      status[issue.provider].latencyMs = issue.avgLatencyMs || status[issue.provider].latencyMs;
      
      // Solo agregar error si no es cancelado por usuario
      if (issue.incidentTag && !isCancelled) status[issue.provider].errors.push(issue.incidentTag);
    });

    console.log('=== FINAL PROVIDER STATUS ===');
    console.log('Final provider status:', status);
    console.log('Provider count:', Object.keys(status).length);
    console.log('Provider names:', Object.keys(status));
    return status;
  };

  const providerStatus = getProviderStatus();

  // Obtener proveedor más utilizado
  const getMostUsedProvider = () => {
    if (Object.keys(providerStatus).length === 0) return null;
    const activeProviders = Object.entries(providerStatus)
      .filter(([_, status]) => status.total > 0);
    
    if (activeProviders.length === 0) return null;
    
    return activeProviders.reduce((prev, current) => 
      (prev[1].total > current[1].total) ? prev : current
    )[0] || null;
  };

  const mostUsedProvider = getMostUsedProvider();
  const availableProviders = Object.keys(providerStatus).sort();

  // Ordenar providers por número de transacciones (de mayor a menor)
  // Los que tienen transacciones primero, luego los demás
  const sortedProviders = Object.entries(providerStatus)
    .sort((a, b) => {
      // Primero ordenar por total de transacciones (descendente)
      if (a[1].total !== b[1].total) {
        return b[1].total - a[1].total;
      }
      // Si tienen el mismo total, ordenar alfabéticamente
      return a[0].localeCompare(b[0]);
    })
    .map(([provider]) => provider);

  console.log('All providers:', Object.keys(providerStatus));
  console.log('Sorted providers:', sortedProviders);
  console.log('Most used provider:', mostUsedProvider);

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
      {selectedMerchant && safeMerchantDetail ? (
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
                  const latencyMs = pStatus.latencyMs || 0;
                  const latencyDisplay = latencyMs > 0 ? (latencyMs / 1000).toFixed(2) : 'N/A';

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
                            Latency: {latencyDisplay === 'N/A' ? 'N/A' : latencyDisplay + 's'}
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
                    sortedProviders.map((provider) => {
                      const providerTotal = providerStatus[provider].total;
                      const isMostUsed = provider === mostUsedProvider && providerTotal > 0;
                      const hasNoTransactions = providerTotal === 0;
                      
                      return (
                        <Box
                          key={provider}
                          sx={{
                            p: 2,
                            backgroundColor: isMostUsed ? 'rgba(255, 184, 28, 0.15)' : hasNoTransactions ? 'rgba(160, 174, 192, 0.05)' : 'rgba(0, 208, 132, 0.1)',
                            border: isMostUsed ? '2px solid rgba(255, 184, 28, 0.4)' : hasNoTransactions ? '1px solid rgba(160, 174, 192, 0.3)' : '1px solid rgba(0, 208, 132, 0.3)',
                            borderRadius: 1.5,
                            minWidth: '160px',
                            textAlign: 'center',
                            position: 'relative',
                            flex: '0 1 auto'
                          }}
                        >
                          {isMostUsed && (
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
                          <Typography variant="body2" sx={{ color: isMostUsed ? '#FFB81C' : hasNoTransactions ? '#A0AEC0' : '#00D084', fontWeight: 700, mb: 1.5, mt: isMostUsed ? 1.5 : 0 }}>
                            {provider}
                          </Typography>
                          <Chip
                            label={hasNoTransactions ? 'No transactions' : `Transactions: ${providerTotal}`}
                            size="small"
                            sx={{
                              backgroundColor: isMostUsed ? '#FFB81C' : hasNoTransactions ? '#2D3748' : '#00D084',
                              color: isMostUsed ? '#000' : '#fff',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              width: '100%',
                              justifyContent: 'center'
                            }}
                          />
                        </Box>
                      );
                    })
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
                    const recommendation = getRecommendation(issue.incidentTag, issue.mainErrorCategory, issue.totalEvents, issue.mainErrorType);
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
