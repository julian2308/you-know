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
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
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
