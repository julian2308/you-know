import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Badge, Menu, MenuItem, Typography, Divider, useMediaQuery, useTheme } from '@mui/material';
import { Notifications, Menu as MenuIcon } from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';

const Topbar = ({ alerts = [], onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      sx={{ 
        backgroundColor: 'rgba(21, 27, 46, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#FFFFFF'
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 1, color: '#0F7AFF' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span style={{
            color: '#0F7AFF',
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: 1,
            fontFamily: 'Inter, Segoe UI, Roboto, sans-serif',
          }}>
            You Know
          </span>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton sx={{ color: '#A0AEC0' }} onClick={handleOpen} aria-label="critical alerts">
          <Badge badgeContent={alerts.length} color="error">
            <Notifications />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              minWidth: 320,
              background: '#151B2E',
              color: '#fff',
              border: '1px solid #222',
              mt: 1.5
            }
          }}
        >
          <Typography sx={{ px: 2, pt: 1, fontWeight: 700, color: '#FF3B30' }}>
            Critical Alerts
          </Typography>
          <Divider sx={{ my: 1, background: 'rgba(255,255,255,0.08)' }} />
          {alerts.length === 0 && (
            <MenuItem disabled sx={{ color: '#A0AEC0' }}>No critical alerts</MenuItem>
          )}
          {alerts.map((alert, idx) => (
            <MenuItem key={alert.id || idx} sx={{ alignItems: 'flex-start', gap: 1, whiteSpace: 'normal' }}>
              <ErrorIcon sx={{ color: '#FF3B30', mr: 1, mt: 0.5 }} />
              <Box>
                {/* Mostrar formato para alertas críticas generadas localmente */}
                {alert.provider && alert.errorMessage ? (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#FF3B30' }}>{alert.provider}</Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{alert.errorMessage}</Typography>
                    <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                      {alert.failureCount} failed payin(s) • Rate: {alert.failureRate}%
                    </Typography>
                  </>
                ) : (
                  // Mostrar formato para alertas recibidas por WebSocket
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                      🚨 {alert.level || "Alert"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                      {alert.timestamp && (new Date(alert.timestamp).toLocaleTimeString())}
                    </Typography>
                  </>
                )}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
