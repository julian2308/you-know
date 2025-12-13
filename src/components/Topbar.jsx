import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Badge, Menu, MenuItem, Typography, Divider } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';

const Topbar = ({ drawerWidth, alerts = [] }) => {
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
        <Box sx={{ flexGrow: 1 }} />
        <IconButton sx={{ color: '#A0AEC0' }} onClick={handleOpen} aria-label="alertas críticas">
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
            Alertas Críticas
          </Typography>
          <Divider sx={{ my: 1, background: 'rgba(255,255,255,0.08)' }} />
          {alerts.length === 0 && (
            <MenuItem disabled sx={{ color: '#A0AEC0' }}>No hay alertas críticas</MenuItem>
          )}
          {alerts.map((alert, idx) => (
            <MenuItem key={alert.id} sx={{ alignItems: 'flex-start', gap: 1, whiteSpace: 'normal' }}>
              <ErrorIcon sx={{ color: '#FF3B30', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FF3B30' }}>{alert.provider}</Typography>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{alert.errorMessage}</Typography>
                <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                  {alert.failureCount} payout(s) fallido(s) • Tasa: {alert.failureRate}%
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
