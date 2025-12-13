import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu as MenuIcon, Notifications } from '@mui/icons-material';

const Topbar = ({ drawerWidth }) => {
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
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#FFFFFF', fontWeight: 700 }}>
          You Know
        </Typography>
        <IconButton sx={{ color: '#A0AEC0' }}>
          <Notifications />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
