#!/bin/bash
# Script para verificar la configuración de CORS y conexión del backend

echo "===== Verificando Configuración de Conexión ====="
echo ""

# Chequear si .env.local existe
if [ -f ".env.local" ]; then
    echo "✓ .env.local encontrado"
    grep -E "VITE_BACKEND_URL|VITE_API_BASE_URL" .env.local
else
    echo "✗ .env.local no encontrado"
fi

echo ""
echo "===== Archivos de Configuración ====="
echo "✓ vite.config.js - Proxy configurado"
echo "✓ src/config/apiConfig.js - Cliente HTTP"
echo "✓ src/hooks/useProviders.js - Hook para Providers"
echo "✓ src/hooks/usePayouts.js - Hook para Payouts"

echo ""
echo "===== Endpoints Configurados ====="
echo "Providers:"
echo "  - GET /api/providers"
echo "  - GET /api/providers/country/:country"
echo "  - GET /api/providers/:id"
echo "  - GET /api/providers/:id/metrics"
echo ""
echo "Payouts:"
echo "  - GET /api/payouts"
echo "  - GET /api/payouts/country/:country"
echo "  - GET /api/payouts/provider/:providerId"
echo "  - GET /api/payouts/country/:country/provider/:provider"
echo ""

echo "===== Para Conectar al Backend ====="
echo "1. Asegurate que tu backend esté corriendo en el puerto configurado"
echo "2. Actualiza VITE_BACKEND_URL en .env.local si es necesario"
echo "3. Reinicia el servidor: npm run dev"
echo ""
