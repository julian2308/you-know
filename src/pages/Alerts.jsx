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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
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
            'Review transaction logs',
            'Validate provider status',
            'Contact support'
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
          text: 'CRITICAL'
        };
      case 'warning':
        return {
          bg: 'rgba(255, 149, 0, 0.1)',
          border: '#FF9500',
          icon: '#FF9500',
          text: 'WARNING'
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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Alerts
        </Typography>
        <Typography variant="body2" sx={{ color: '#A0AEC0', mb: 3 }}>
          Intelligent alerts and recommendations for payment routing.
        </Typography>
      </Box>

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
            <Typography variant="caption">Critical</Typography>
            <Typography variant="h5" fontWeight={700} color="#FF3B30">
              {allAlerts.filter(a => a.severity === 'critical').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Warnings</Typography>
            <Typography variant="h5" fontWeight={700} color="#FF9500">
              {allAlerts.filter(a => a.severity === 'warning').length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* FILTER TABS */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={filterTab} onChange={(e, v) => setFilterTab(v)}>
          <Tab label={`All (${allAlerts.length})`} />
          <Tab label={`Critical (${allAlerts.filter(a => a.severity === 'critical').length})`} />
          <Tab label={`Warnings (${allAlerts.filter(a => a.severity === 'warning').length})`} />
          <Tab label={`Info (${allAlerts.filter(a => a.severity === 'info').length})`} />
        </Tabs>
      </Paper>

      {/* ALERTAS (TABLA) */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Provider</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Recommended Actions</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#00D084', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700}>
                    No alerts
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map(alert => {
                const colors = getSeverityColor(alert.severity);
                const expanded = expandedAlert === alert.id;

                return (
                  <TableRow
                    key={alert.id}
                    sx={{
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Chip label={alert.provider} size="small" />
                    </TableCell>
                    <TableCell>
                      {alert.errorCode}
                    </TableCell>
                    <TableCell>
                      {alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Warning' : 'Info'}
                    </TableCell>
                    <TableCell>
                      {alert.errorMessage}
                    </TableCell>
                    <TableCell>
                      {alert.severity !== 'warning' ? (
                        <List dense>
                          {alert.actions.map((action, i) => (
                            <ListItem key={i}>
                              <ListItemIcon>
                                <LightbulbIcon color="warning" />
                              </ListItemIcon>
                              <ListItemText primary={action} />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#A0AEC0', fontStyle: 'italic' }}>
                          No actions required
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(alert.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Alerts;
