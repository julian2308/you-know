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

import { OVERVIEW_ENDPOINT, apiClient } from '../config/apiConfig';

const Alerts = () => {
  const [filterTab, setFilterTab] = useState(0);
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('2025-12-10T08:00');
  const [toDate, setToDate] = useState('2025-12-15T12:00');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const url = OVERVIEW_ENDPOINT(fromDate, toDate);
        const data = await apiClient.get(url);

        // Map activeIssues to alerts format - only include issues with failures
        const alerts = (data?.activeIssues || [])
          .filter(issue => (issue.failedEvents || 0) > 0 || (issue.errorRate || 0) > 0)
          .map(issue => ({
            id: `${issue.merchantId}-${issue.incidentTag}`,
            provider: issue.provider,
            severity:
              issue.impactLevel === 'high'
                ? 'critical'
                : issue.impactLevel === 'medium'
                ? 'warning'
                : 'info',
            errorCode: issue.incidentTag,
            errorMessage: issue.title,
            description: issue.description,
            failureCount: issue.failedEvents || 0,
            failureRate: (issue.errorRate || 0).toFixed(1),
            merchantName: issue.merchantName,
            countryCode: issue.countryCode,
            paymentMethod: issue.paymentMethod,
            suggestedAction: issue.suggestedActionType,
            firstSeen: issue.firstSeen,
            lastSeen: issue.lastSeen
          }));

        setAllAlerts(alerts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [fromDate, toDate]);

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
                const colors = getSeverityColor(alert.severity);

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
                        label={alert.severity.toUpperCase()}
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
