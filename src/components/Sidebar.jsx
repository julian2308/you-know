import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import { Home, Notifications } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;


const Sidebar = () => {
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
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 72,
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <span style={{
          color: '#0F7AFF',
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 1,
          fontFamily: 'Inter, Segoe UI, Roboto, sans-serif',
        }}>
          You Know
        </span>
      </Box>
      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List>
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/alerts">
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText primary="Alertas" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
