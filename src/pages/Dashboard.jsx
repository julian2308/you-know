import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Pagos
      </Typography>
      <Grid container spacing={3}>
        {/* Fila de Tarjetas de KPI */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Total Transacciones</Typography>
            <Typography variant="h4">1,234</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Tasa de Éxito</Typography>
            <Typography variant="h4">98.5%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Total Fallos</Typography>
            <Typography variant="h4">18</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Ingresos Totales</Typography>
            <Typography variant="h4">$12,345</Typography>
          </Paper>
        </Grid>

        {/* Gráfico de Líneas - Tendencia Temporal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6">Tendencia de Transacciones</Typography>
            {/* Aquí irá el gráfico de líneas */}
          </Paper>
        </Grid>

        {/* Gráfico de Torta - Distribución de Estado */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6">Distribución de Estados</Typography>
            {/* Aquí irá el gráfico de torta */}
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Top Merchants */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6">Top 5 Comerciantes</Typography>
            {/* Aquí irá el gráfico de barras */}
          </Paper>
        </Grid>

        {/* Gráfico de Barras - Errores Comunes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
            <Typography variant="h6">Causas de Fallo Comunes</Typography>
            {/* Aquí irá el gráfico de barras */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
