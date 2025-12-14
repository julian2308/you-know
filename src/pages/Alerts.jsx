import React, { useState, useEffect } from 'react';
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
  Tab
} from '@mui/material';

import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import { mockData } from '../data/mockData';
import { client } from '../conf/ws';

const Alerts = ({ allAlerts: initialAlerts = [] }) => {
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [filterTab, setFilterTab] = useState(0);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);

  /* =========================
     MÉTRICAS (NO TOCAR)
     ========================= */
  const payins = mockData.payinEvents;
  const succeeded = payins.filter(p => p.status === 'SUCCEEDED').length;
  const failed = payins.filter(p => p.status === 'FAILED').length;
  const totalPayins = payins.length;
  const successRate = ((succeeded / totalPayins) * 100).toFixed(1);
  const totalVolume = payins.reduce((sum, p) => sum + p.amount, 0);
  const avgLatency = (
    payins.reduce(
      (sum, p) => sum + (p.processing_time_sec || p.latency_ms / 1000),
      0
    ) / totalPayins
  ).toFixed(2);

  const calculateSecurityScore = () => {
    let score = 100;
    const successFactor = (parseFloat(successRate) / 100) * 40;
    score -= (40 - successFactor);

    const passedRiskChecks = payins.filter(
      p => p.risk_checks && p.risk_checks.length > 0
    ).length;
    const riskCheckFactor = (passedRiskChecks / totalPayins) * 30;
    score -= (30 - riskCheckFactor);

    const timeouts = payins.filter(
      p => p.error_code === 'PROVIDER_TIMEOUT'
    ).length;
    const latencyPenalty = (timeouts / totalPayins) * 20;
    score -= latencyPenalty;

    const providers = Array.from(
      new Set(payins.map(p => p.provider))
    ).length;
    const diversificationFactor = Math.min((providers / 3) * 10, 10);
    score += diversificationFactor;

    return Math.max(score, 0);
  };

  const securityScore = calculateSecurityScore();

  /* =========================
     WEBSOCKET ALERTS (REALTIME)
     ========================= */
  useEffect(() => {
    client.onConnect = () => {
      client.subscribe('/topic/alerts', msg => {
        const wsAlert = JSON.parse(msg.body);

        // Adaptar WS → modelo visual existente
        const adaptedAlert = {
          id: wsAlert.id || `ws-${Date.now()}`,
          provider: wsAlert.provider || 'UNKNOWN',
          severity:
            wsAlert.level === 'CRITICAL'
              ? 'critical'
              : wsAlert.level === 'WARNING'
              ? 'warning'
              : 'info',
          errorCode: wsAlert.code || 'UNDEFINED',
          errorMessage: wsAlert.message,
          failureCount: wsAlert.failureCount || 1,
          failureRate: wsAlert.failureRate || '100',
          totalImpact: wsAlert.amount || 0,
          actions: wsAlert.actions || [
            'Revisar logs de la transacción',
            'Validar estado del proveedor',
            'Contactar soporte'
          ],
          affectedPayins: []
        };

        setRealtimeAlerts(prev => [adaptedAlert, ...prev]);
      });
    };

    client.activate();
    return () => client.deactivate();
  }, []);

  /* =========================
     ALERTAS (SOLO WS)
     ========================= */
  const allAlerts = initialAlerts.length > 0 ? initialAlerts : realtimeAlerts;

  const filteredAlerts =
    filterTab === 0
      ? allAlerts
      : filterTab === 1
      ? allAlerts.filter(a => a.severity === 'critical')
      : filterTab === 2
      ? allAlerts.filter(a => a.severity === 'warning')
      : allAlerts.filter(a => a.severity === 'info');

  const getSeverityColor = severity => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'rgba(255, 59, 48, 0.1)',
          border: '#FF3B30',
          icon: '#FF3B30',
          text: 'CRÍTICO'
        };
      case 'warning':
        return {
          bg: 'rgba(255, 149, 0, 0.1)',
          border: '#FF9500',
          icon: '#FF9500',
          text: 'ADVERTENCIA'
        };
      default:
        return {
          bg: 'rgba(15, 122, 255, 0.1)',
          border: '#0F7AFF',
          icon: '#0F7AFF',
          text: 'INFO'
        };
    }
  };

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Centro de Alertas
        </Typography>
        <Typography variant="body2" color="#A0AEC0">
          Monitoreo centralizado de problemas por proveedor
        </Typography>
      </Box>

      {/* METRICS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Total Alertas</Typography>
            <Typography variant="h5" fontWeight={700}>
              {allAlerts.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Críticas</Typography>
            <Typography variant="h5" fontWeight={700} color="#FF3B30">
              {allAlerts.filter(a => a.severity === 'critical').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Advertencias</Typography>
            <Typography variant="h5" fontWeight={700} color="#FF9500">
              {allAlerts.filter(a => a.severity === 'warning').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Score Seguridad</Typography>
            <Typography variant="h5" fontWeight={700} color="#00D084">
              {securityScore.toFixed(0)}/100
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* FILTER TABS */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={filterTab} onChange={(e, v) => setFilterTab(v)}>
          <Tab label={`Todas (${allAlerts.length})`} />
          <Tab label={`Críticas (${allAlerts.filter(a => a.severity === 'critical').length})`} />
          <Tab label={`Advertencias (${allAlerts.filter(a => a.severity === 'warning').length})`} />
          <Tab label={`Info (${allAlerts.filter(a => a.severity === 'info').length})`} />
        </Tabs>
      </Paper>

      {/* ALERTAS (PARTE INFERIOR) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredAlerts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: '#00D084', mb: 2 }} />
            <Typography variant="h6" fontWeight={700}>
              Sin alertas
            </Typography>
          </Paper>
        ) : (
          filteredAlerts.map(alert => {
            const colors = getSeverityColor(alert.severity);
            const expanded = expandedAlert === alert.id;

            return (
              <Box
                key={alert.id}
                sx={{
                  background: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 2,
                  p: 2
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  onClick={() =>
                    setExpandedAlert(expanded ? null : alert.id)
                  }
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ color: colors.icon }}>
                    {alert.severity === 'critical' ? (
                      <ErrorIcon />
                    ) : (
                      <WarningIcon />
                    )}
                  </Box>

                  <Box flex={1}>
                    <Typography fontWeight={700} color={colors.icon}>
                      {colors.text}
                    </Typography>
                    <Typography>{alert.errorMessage}</Typography>
                    <Chip label={alert.provider} size="small" sx={{ mt: 0.5 }} />
                  </Box>

                  <ExpandMoreIcon
                    sx={{
                      transform: expanded
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                      transition: '0.3s'
                    }}
                  />
                </Box>

                <Collapse in={expanded}>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    {alert.actions.map((action, i) => (
                      <ListItem key={i}>
                        <ListItemIcon>
                          <LightbulbIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={action} />
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="contained" color="error" size="small">
                    Resolver
                  </Button>
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
