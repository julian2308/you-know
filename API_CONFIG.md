# Configuración de API y CORS

## Overview

Este proyecto está configurado para conectarse a un backend remoto. La configuración maneja CORS y proxy automáticamente en desarrollo.

## Estructura de Configuración

### 1. **vite.config.js** - Proxy para desarrollo
```javascript
// Configura un proxy en desarrollo que reenvía las peticiones a /api 
// hacia el backend configurado en VITE_BACKEND_URL
```

### 2. **Variables de Entorno (.env)**

#### Archivos disponibles:
- `.env.local` - **LOCAL** (no se commitea, para configuración personal)
- `.env.development` - Configuración de desarrollo
- `.env.production` - Configuración de producción

#### Variables principales:
```
VITE_BACKEND_URL=http://localhost:3000          # URL del backend
VITE_API_BASE_URL=/api                          # Ruta base de API (proxy)
VITE_ENV=development                            # Ambiente
```

### 3. **config/apiConfig.js** - Cliente HTTP centralizado

Proporciona:
- `apiClient` - Cliente fetch con métodos GET, POST, PUT, DELETE
- `PROVIDERS_ENDPOINTS` - Endpoints para providers
- `PAYOUTS_ENDPOINTS` - Endpoints para payouts
- `SECURITY_ENDPOINTS` - Endpoints para seguridad

#### Uso:
```javascript
import { apiClient, PROVIDERS_ENDPOINTS } from '../config/apiConfig';

// Ejemplo: Obtener providers
const data = await apiClient.get(PROVIDERS_ENDPOINTS.getAll());
```

### 4. **Hooks personalizados**

#### `useProviders`
```javascript
const { 
  providers, 
  loading, 
  error, 
  getProvidersByCountry,
  getProviderMetrics,
  // ... más métodos
} = useProviders();
```

#### `usePayouts`
```javascript
const { 
  payouts, 
  loading, 
  error, 
  getPayoutsByCountryAndProvider,
  // ... más métodos
} = usePayouts();
```

## Flujo de Peticiones en Desarrollo

```
Frontend (localhost:5175)
    ↓
Vite Proxy (/api → http://localhost:3000)
    ↓
Backend (http://localhost:3000)
```

## CORS Configuración

En **desarrollo**, el proxy de Vite maneja CORS automáticamente:
- No necesitas configurar headers CORS en el frontend
- Todas las peticiones a `/api/*` se reenvían al backend
- El backend debe estar corriendo en `http://localhost:3000` (configurable)

En **producción**, deberás:
1. Actualizar `VITE_BACKEND_URL` a la URL real de tu backend
2. Asegurar que el backend tenga CORS habilitado para tu dominio

## Configurar Backend URL

### Opción 1: Variable de Entorno Local
```bash
# En .env.local
VITE_BACKEND_URL=http://tu-backend.com:3000
```

### Opción 2: Variable de Entorno (Sistema)
```bash
export VITE_BACKEND_URL=http://tu-backend.com:3000
npm run dev
```

## Endpoints Disponibles

### Providers
```
GET    /api/providers                          # Todos los providers
GET    /api/providers/country/:country         # Providers por país
GET    /api/providers/:id                      # Provider específico
GET    /api/providers/:id/metrics              # Métricas del provider
GET    /api/providers/:country/:name           # Provider por país y nombre
```

### Payouts
```
GET    /api/payouts                            # Todos los payouts
GET    /api/payouts/country/:country           # Payouts por país
GET    /api/payouts/provider/:providerId       # Payouts por provider
GET    /api/payouts/country/:country/provider/:provider  # Payouts filtrados
GET    /api/payouts/metrics                    # Métricas de payouts
```

### Security/Alerts
```
GET    /api/security/score                     # Score general
GET    /api/security/score/country/:country    # Score por país
GET    /api/security/alerts                    # Todas las alertas
```

## Ejemplo de Uso en Componentes

```jsx
import useProviders from '../hooks/useProviders';
import { apiClient, PROVIDERS_ENDPOINTS } from '../config/apiConfig';

const MyComponent = () => {
  const { providers, loading, error, getProvidersByCountry } = useProviders();

  const handleCountryChange = async (country) => {
    const data = await getProvidersByCountry(country);
    console.log('Providers:', data);
  };

  return (
    // Tu componente aquí
  );
};
```

## Troubleshooting

### Error: "Failed to fetch"
- Verifica que el backend esté corriendo
- Verifica que `VITE_BACKEND_URL` sea correcto en `.env.local`
- Chequea la consola del navegador para más detalles

### CORS Error en Producción
- El backend debe tener CORS habilitado
- Header recomendado: `Access-Control-Allow-Origin: https://tu-dominio.com`

### Proxy no funciona
- Asegurate que usas URLs relativas: `/api/...` (no `http://localhost:3000/...`)
- Reinicia el servidor Vite después de cambiar `.env.local`

## Próximos Pasos

1. ✅ Configurar CORS y proxy
2. ✅ Crear hooks para API
3. ⏳ Conectar componentes a los endpoints reales
4. ⏳ Reemplazar mockData con datos del backend
