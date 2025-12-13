import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme, Toolbar } from '@mui/material';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// Crea un tema oscuro para el dashboard
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const App = () => {
  const drawerWidth = 240;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Sidebar drawerWidth={drawerWidth} />
          <Topbar drawerWidth={drawerWidth} />
          <Box
            component="main"
            sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}
          >
            <Toolbar /> {/* Spacer for Topbar */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Otras rutas pueden ir aquí */}
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
