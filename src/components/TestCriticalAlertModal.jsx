import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert
} from '@mui/material';

const TestCriticalAlertModal = ({ open, onClose, onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Por favor ingresa un correo electrónico');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      await onSubmit(email);
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al generar alertas críticas');
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: '#FF3B30' }}>
        🧪 Generar Alertas Críticas de Prueba
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ color: '#00D084', fontWeight: 700, mb: 1 }}>
              ✓ ¡Éxito!
            </Typography>
            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
              Alertas críticas generadas correctamente
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                Ingresa tu correo electrónico para generar alertas críticas de prueba:
              </Typography>
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="ejemplo@email.com"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#334155'
                  }
                }}
                InputLabelProps={{
                  sx: { color: '#A0AEC0' }
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#A0AEC0' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || success}
          variant="contained"
          sx={{
            backgroundColor: '#FF3B30',
            '&:hover': { backgroundColor: '#E63128' },
            fontWeight: 600
          }}
        >
          {loading ? 'Generando...' : 'Generar Alertas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestCriticalAlertModal;
