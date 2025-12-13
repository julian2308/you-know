import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, useMediaQuery, useTheme } from '@mui/material';
import { Home, Notifications } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 80;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerContent = (
    <Box sx={{ overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
        <ListItem component={Link} to="/" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer' }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Home sx={{ fontSize: 28, color: '#0F7AFF' }} />
          </ListItemIcon>
        </ListItem>
        <ListItem component={Link} to="/alerts" onClick={() => isMobile && onMobileClose()} sx={{ justifyContent: 'center', p: 1.5, cursor: 'pointer' }}>
          <ListItemIcon sx={{ justifyContent: 'center', minWidth: 40 }}>
            <Notifications sx={{ fontSize: 28, color: '#0F7AFF' }} />
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
        {drawerContent}
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
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
