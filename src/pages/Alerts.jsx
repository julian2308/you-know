import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Collapse,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';

import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import { useAlerts } from '../hooks/useAlertsWarnings';
import { useCriticalAlerts } from '../hooks/useCriticalAlerts';
import errorRecommendations from '../constants/errorRecommendations.json';
import TestCriticalAlertModal from '../components/TestCriticalAlertModal';
import { apiClient } from '../config/apiConfig';

const Alerts = () => {
  const [filterTab, setFilterTab] = useState(0);
  const [expandedAlerts, setExpandedAlerts] = useState({});
  const [openTestModal, setOpenTestModal] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const fromDate = '2020-01-01T00:00';
  const toDate = '2099-12-31T23:59';
  
  // Filtros de búsqueda
  const [searchFilters, setSearchFilters] = useState({
    provider: '',
    incidentType: '',
    merchant: '',
    country: ''
  });

  // Usar React Query para alertas warnings
  const { data: allAlerts = [], isLoading: alertsLoading } = useAlerts(fromDate, toDate);
  
  // Usar React Query para alertas críticas
  const { data: criticalAlerts = [], isLoading: criticalLoading } = useCriticalAlerts(fromDate, toDate);
  
  const loading = alertsLoading || criticalLoading;

  const handleGenerateTestAlert = async (email) => {
    setTestLoading(true);
    try {
      // Construir la URL con el parámetro EMAIL
      const url = `https://preearthquake-shinily-lorenza.ngrok-free.dev/api/alerts?email=${encodeURIComponent(email)}`;
      
      // Datos de la alerta de prueba
      const alertData = {
        merchantId: "m_travelgo",
        merchantName: "TravelGo",
        countryCode: "PE",
        provider: "PAYU",
        incidentTag: "INC-PE-CARD-USER-003",
        category: "PROVIDER",
        lastSeen: new Date().toISOString()
      };
      
      // Enviar POST con el body especificado
      await apiClient.post(url, alertData);
    } catch (err) {
      console.error('Error generating test alert:', err);
      throw new Error('No se pudo generar la alerta de prueba. Intenta nuevamente.');
    } finally {
      setTestLoading(false);
    }
  };

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



  // Aplicar filtros de búsqueda
  const baseAlerts = filterTab === 0 ? allAlerts : criticalAlerts;
  const filteredAlerts = baseAlerts.filter(alert => {
    const matchProvider = !searchFilters.provider || alert.provider?.toLowerCase().includes(searchFilters.provider.toLowerCase());
    const matchIncident = !searchFilters.incidentType || alert.errorCode?.toLowerCase().includes(searchFilters.incidentType.toLowerCase());
    const matchMerchant = !searchFilters.merchant || alert.merchantName?.toLowerCase().includes(searchFilters.merchant.toLowerCase());
    const matchCountry = !searchFilters.country || alert.countryCode?.toLowerCase().includes(searchFilters.country.toLowerCase());
    
    return matchProvider && matchIncident && matchMerchant && matchCountry;
  });

  const getSeverityColor = (alert) => {
    // Usar la propiedad isCritical de la alerta
    const isCritical = alert?.isCritical === true;
    
    if (isCritical) {
      return {
        bg: 'rgba(255, 59, 48, 0.1)',
        border: '#FF3B30',
        icon: '#FF3B30',
        text: 'CRITICAL',
        severity: 'CRITICAL'
      };
    }
    return {
      bg: 'rgba(255, 149, 0, 0.1)',
      border: '#FF9500',
      icon: '#FF9500',
      text: 'WARNING',
      severity: 'WARNING'
    };
  };

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography>Loading alerts...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Alerts
          </Typography>
          <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>
            Intelligent alerts and recommendations for payment routing.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setOpenTestModal(true)}
          sx={{
            borderColor: '#FF3B30',
            color: '#FF3B30',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(255, 59, 48, 0.08)',
              borderColor: '#FF3B30'
            }
          }}
        >
          🧪 Test Alert
        </Button>
      </Box>

      {/* TEST MODAL */}
      <TestCriticalAlertModal
        open={openTestModal}
        onClose={() => setOpenTestModal(false)}
        onSubmit={handleGenerateTestAlert}
        loading={testLoading}
      />

      {/* METRICS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Total Alerts</Typography>
            <Typography variant="h5" fontWeight={700}>
              {allAlerts.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Critical Issues</Typography>
            <Typography variant="h5" fontWeight={700} color="#FF3B30">
              {criticalAlerts.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Total Issues</Typography>
            <Typography variant="h5" fontWeight={700} color="#FF9500">
              {allAlerts.length + criticalAlerts.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* FILTER TABS */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={filterTab} onChange={(e, v) => setFilterTab(v)}>
          <Tab label={`Alerts (${allAlerts.length})`} />
          <Tab label={`Critical (${criticalAlerts.length})`} />
        </Tabs>
      </Paper>

      {/* SEARCH FILTERS */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                Provider
              </Typography>
              <input
                type="text"
                placeholder="Search by provider..."
                value={searchFilters.provider}
                onChange={(e) => setSearchFilters({ ...searchFilters, provider: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#1E293B',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                Incident Type
              </Typography>
              <input
                type="text"
                placeholder="Search by incident type..."
                value={searchFilters.incidentType}
                onChange={(e) => setSearchFilters({ ...searchFilters, incidentType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#1E293B',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                Merchant
              </Typography>
              <input
                type="text"
                placeholder="Search by merchant..."
                value={searchFilters.merchant}
                onChange={(e) => setSearchFilters({ ...searchFilters, merchant: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#1E293B',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                Country
              </Typography>
              <input
                type="text"
                placeholder="Search by country..."
                value={searchFilters.country}
                onChange={(e) => setSearchFilters({ ...searchFilters, country: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#1E293B',
                  color: '#fff',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ALERTAS (TABLA) */}
      <Paper>
        {filteredAlerts.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center', backgroundColor: '#151B2E' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: '#00D084' }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: '#00D084' }}>
                ✓ Everything is working perfectly!
              </Typography>
              <Typography variant="body2" sx={{ color: '#A0AEC0', maxWidth: 400 }}>
                No issues detected. All transactions are processing smoothly.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="40"></TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Incident Type</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Error Rate</TableCell>
                <TableCell>Last Seen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAlerts.map(alert => {
                const colors = getSeverityColor(alert);
                const isExpanded = expandedAlerts[alert.id] || false;
                const recommendation = getRecommendation(alert.errorCode, alert.mainErrorCategory, alert.totalEvents, alert.mainErrorType);

                return (
                  <React.Fragment key={alert.id}>
                    <TableRow
                      sx={{
                        background: colors.bg,
                        border: `2px solid ${colors.border}`,
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell width="40" sx={{ textAlign: 'center' }}>
                        <Button
                          size="small"
                          onClick={() => toggleExpandAlert(alert.id)}
                          sx={{
                            minWidth: 0,
                            p: 0,
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }}
                        >
                          <ExpandMoreIcon sx={{ fontSize: 20 }} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Chip label={alert.provider} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {alert.errorCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{alert.merchantName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {alert.countryCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.isCritical ? 'CRITICAL' : 'WARNING'}
                          size="small"
                          sx={{
                            background: colors.border,
                            color: '#fff',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.border }}>
                          {alert.failureRate}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                          {new Date(alert.lastSeen).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {isExpanded && recommendation && (
                      <TableRow sx={{ background: 'rgba(0, 0, 0, 0.1)' }}>
                        <TableCell colSpan={8} sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', gap: 3 }}>
                            <LightbulbIcon sx={{ fontSize: 28, color: '#FF9500', flexShrink: 0 }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                                Take action to resolve
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2, color: '#A0AEC0' }}>
                                {recommendation.whatToDo}
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                                Recommended steps:
                              </Typography>
                              <List sx={{ pl: 0, py: 0 }}>
                                {recommendation.actions.map((action, idx) => (
                                  <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: colors.border }}>
                                        {idx + 1}.
                                      </Typography>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={action}
                                      primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #2D3748' }}>
                                <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                                  <strong>Estimated time to resolve:</strong> {recommendation.estimatedResolutionTime}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default Alerts;
