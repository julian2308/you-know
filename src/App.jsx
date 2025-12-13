import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme, Toolbar } from '@mui/material';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

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
  const drawerWidth = 240;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#0A0E27' }}>
          <Sidebar drawerWidth={drawerWidth} />
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Topbar drawerWidth={drawerWidth} />
            <Box
              component="main"
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto',
                backgroundColor: '#0A0E27',
                p: 3,
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
