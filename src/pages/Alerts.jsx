import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Collapse, Button, Divider, List, ListItem, ListItemIcon, ListItemText, Chip, Tabs, Tab } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SecurityIcon from '@mui/icons-material/Security';
import { mockData } from '../data/mockData';

const Alerts = () => {
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [filterTab, setFilterTab] = useState(0);

  const payouts = mockData.payoutEvents;
  const succeeded = payouts.filter(p => p.status === 'SUCCEEDED').length;
  const failed = payouts.filter(p => p.status === 'FAILED').length;
  const totalPayouts = payouts.length;
  const successRate = ((succeeded / totalPayouts) * 100).toFixed(1);
  const totalVolume = payouts.reduce((sum, p) => sum + p.amount, 0);
  const avgLatency = (payouts.reduce((sum, p) => sum + (p.processing_time_sec || p.latency_ms / 1000), 0) / totalPayouts).toFixed(2);

  // Calcular Security Score
  const calculateSecurityScore = () => {
    let score = 100;
    const successFactor = (parseFloat(successRate) / 100) * 40;
    score -= (40 - successFactor);
    const passedRiskChecks = payouts.filter(p => p.risk_checks && p.risk_checks.length > 0).length;
    const riskCheckFactor = (passedRiskChecks / totalPayouts) * 30;
    score -= (30 - riskCheckFactor);
    const timeouts = payouts.filter(p => p.error_code === 'PROVIDER_TIMEOUT').length;
    const latencyPenalty = (timeouts / totalPayouts) * 20;
    score -= latencyPenalty;
    const providers = Array.from(new Set(payouts.map(p => p.provider))).length;
    const diversificationFactor = Math.min((providers / 3) * 10, 10);
    score += diversificationFactor;
    return Math.max(score, 0);
  };

  const securityScore = calculateSecurityScore();

  // Generar alertas
  const generateAlerts = () => {
    const alerts = [];
    const providerErrors = {};

    payouts.forEach(payout => {
      if (payout.status === 'FAILED') {
        if (!providerErrors[payout.provider]) {
          providerErrors[payout.provider] = [];
        }
        providerErrors[payout.provider].push(payout);
      }
    });

    Object.entries(providerErrors).forEach(([provider, failedPayouts]) => {
      const failureRate = (failedPayouts.length / payouts.filter(p => p.provider === provider).length) * 100;
      const totalImpact = failedPayouts.reduce((sum, p) => sum + p.amount, 0);

      let severity = 'info';
      if (securityScore < 60 || failureRate > 50) severity = 'critical';
      else if (failureRate > 25 || securityScore < 80) severity = 'warning';

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

  const allAlerts = generateAlerts();
  
  const filteredAlerts = filterTab === 0 
    ? allAlerts 
    : filterTab === 1 
    ? allAlerts.filter(a => a.severity === 'critical')
    : filterTab === 2
    ? allAlerts.filter(a => a.severity === 'warning')
    : allAlerts.filter(a => a.severity === 'info');

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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Centro de Alertas
        </Typography>
        <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
          Monitoreo centralizado de problemas por proveedor • Acciones recomendadas según nivel de seguridad
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, background: 'rgba(15, 122, 255, 0.1)', border: '1px solid rgba(15, 122, 255, 0.3)' }}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 600 }}>Total Alertas</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>{allAlerts.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 600 }}>Críticas</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#FF3B30' }}>
              {allAlerts.filter(a => a.severity === 'critical').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.3)' }}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 600 }}>Advertencias</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#FF9500' }}>
              {allAlerts.filter(a => a.severity === 'warning').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, background: 'rgba(0, 208, 132, 0.1)', border: '1px solid rgba(0, 208, 132, 0.3)' }}>
            <Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 600 }}>Score Seguridad</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: '#00D084' }}>
              {securityScore.toFixed(0)}/100
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={filterTab} onChange={(e, newValue) => setFilterTab(newValue)} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Tab label={`Todas (${allAlerts.length})`} />
          <Tab label={`Críticas (${allAlerts.filter(a => a.severity === 'critical').length})`} />
          <Tab label={`Advertencias (${allAlerts.filter(a => a.severity === 'warning').length})`} />
          <Tab label={`Info (${allAlerts.filter(a => a.severity === 'info').length})`} />
        </Tabs>
      </Paper>

      {/* Alerts List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredAlerts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: '#00D084', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              ¡Sin alertas!
            </Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
              Todo está funcionando correctamente en este momento
            </Typography>
          </Paper>
        ) : (
          filteredAlerts.map((alert, idx) => {
            const colors = getSeverityColor(alert.severity);
            const isExpanded = expandedAlert === alert.id;

            return (
              <Box
                key={alert.id}
                sx={{
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 2,
                  p: 2,
                  transition: 'all 0.3s ease'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}>
                  <Box sx={{ color: colors.icon, fontSize: 24 }}>
                    {alert.severity === 'critical' ? <ErrorIcon /> : <WarningIcon />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: colors.icon }}>
                        {colors.text}
                      </Typography>
                      <Chip
                        label={alert.provider}
                        size="small"
                        sx={{
                          backgroundColor: `${colors.border}33`,
                          color: colors.icon,
                          fontWeight: 600,
                          height: 24
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {alert.errorMessage}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                        • {alert.failureCount} payout(s) fallido(s)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                        • Tasa de fallo: {alert.failureRate}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                        • Impacto: ${alert.totalImpact.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  <ExpandMoreIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </Box>

                <Collapse in={isExpanded} sx={{ mt: 2 }}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <LightbulbIcon sx={{ fontSize: 20, color: '#FFB81C' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Acciones Recomendadas:
                      </Typography>
                    </Box>
                    <List sx={{ py: 0 }}>
                      {alert.actions.map((action, i) => (
                        <ListItem key={i} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F7AFF' }}>
                              {i + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={action}
                            primaryTypographyProps={{ variant: 'body2', sx: { color: '#E2E8F0' } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        background: colors.icon,
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      Resolver
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: colors.icon,
                        color: colors.icon,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Ver detalles
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default Alerts;
