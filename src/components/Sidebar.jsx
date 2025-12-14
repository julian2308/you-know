import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, useMediaQuery, useTheme } from '@mui/material';
import { Home, Notifications, Business, Store } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import logoYuno from '@/assets/LOGOS/YUNO_ISO_BLUE.png';

const drawerWidth = 80;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const mobileDrawerContent = (
    <Box sx={{ overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
        <ListItem component={Link} to="/" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Dashboard', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Home sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
        <ListItem component={Link} to="/merchants" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Mi Negocio', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Store sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
        <ListItem component={Link} to="/providers" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Providers', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Business sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
        <ListItem component={Link} to="/alerts" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Alertas', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Notifications sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
      </List>
    </Box>
  );

  const desktopDrawerContent = (
    <Box sx={{ overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
      <Box sx={{ mb: 2 }}>
        <img src={logoYuno} alt="Yuno Logo" width={50} height={50} style={{ borderRadius: '4px' }} />
      </Box>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
        <ListItem component={Link} to="/" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Dashboard', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Home sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
        <ListItem component={Link} to="/merchants" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Mi Negocio', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Store sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
        <ListItem component={Link} to="/providers" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Providers', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Business sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
        <ListItem component={Link} to="/alerts" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer', title: 'Alertas', '&:hover': { backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '8px' } }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Notifications sx={{ fontSize: 28, color: '#FFFFFF' }} />
          </ListItemIcon>
        </ListItem>
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: '#151B2E',
            borderRight: '1px solid rgba(255,255,255,0.08)'
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: '#151B2E',
          borderRight: '1px solid rgba(255,255,255,0.08)'
        },
      }}
    >
      {desktopDrawerContent}
    </Drawer>
  );
};

export default Sidebar;
