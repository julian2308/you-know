import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Providers from './pages/Providers';
import { mockData } from './data/mockData';
import usePayoutMetrics from './hooks/usePayoutMetrics';
import useSecurityScore from './hooks/useSecurityScore';
import useAlerts from './hooks/useAlerts';
import { useEffect, useState } from "react";
import { client } from "./conf/ws";

// Tema profesional para You Know - Dashboard de Pagos
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0F7AFF',
      light: '#3B9DFF',
      dark: '#0052CC',
    },
    secondary: {
      main: '#00D084',
      light: '#26E5A0',
      dark: '#00A86F',
    },
    success: {
      main: '#00D084',
    },
    error: {
      main: '#FF3B30',
    },
    warning: {
      main: '#FF9500',
    },
    background: {
      default: '#0A0E27',
      paper: '#151B2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#151B2E',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(21, 27, 46, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});


const App = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [alerts, setAlerts] = useState([]);


  useEffect(() => {
    client.onConnect = () => {
    client.subscribe("/topic/alerts", msg => {
      const alert = JSON.parse(msg.body);
      setAlerts(prev => [alert, ...prev]);
    });

  };

  client.activate();

    return () => {
      client.deactivate();
    };
  }, []);
  
  // Obtener métricas y alertas críticas
  const payouts = mockData.payoutEvents;
  const metrics = usePayoutMetrics(payouts);
  const security = useSecurityScore(payouts, metrics.successRate);
  const allAlerts = useAlerts(payouts, security.score);
  const criticalAlerts = allAlerts.filter(a => a.severity === 'critical').slice(0, 3);


  return (
    
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#0A0E27', width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
          <Sidebar mobileOpen={mobileDrawerOpen} onMobileClose={() => setMobileDrawerOpen(false)} />
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, width: { xs: '100%', md: 'auto' } }}>
            <Topbar alerts={criticalAlerts} onMenuClick={() => setMobileDrawerOpen(!mobileDrawerOpen)} />
            <Box
              component="main"
              sx={{ 
                flexGrow: 1, 
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundColor: '#0A0E27',
                p: 3,
              }}
            >
              <div style={{ padding: 20 }}>
                {alerts.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    {alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#ffe5e5",
                          border: "1px solid #ff9999",
                          padding: 10,
                          marginBottom: 8,
                          borderRadius: 4
                        }}
                      >
                        <strong>🚨 {alert.level}</strong>
                        <div>{alert.message}</div>
                        <small>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/alerts" element={<Alerts />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
