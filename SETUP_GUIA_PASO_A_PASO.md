# 🚀 GUÍA PASO A PASO: Conectar Backend

## ¿Qué se configuró?

✅ **CORS proxy** en Vite  
✅ **Cliente HTTP centralizado** (apiConfig.js)  
✅ **Hooks personalizados** para Providers y Payouts  
✅ **Variables de entorno** para todos los ambientes  
✅ **Scripts de testing** para verificar conexión  

---

## 📋 PASO 1: Verificar que tu Backend esté corriendo

```bash
# Tu backend debe estar en http://localhost:3000 (por defecto)
# Si está en otro puerto, actualiza .env.local

# Verifica desde tu terminal:
curl http://localhost:3000/providers
```

Si ves datos JSON → ✅ Backend ok

---

## 📝 PASO 2: Configurar Variables de Entorno

### Abre `.env.local` y verifica:

```env
VITE_BACKEND_URL=http://localhost:3000  # Cambiar si tu backend usa otro puerto
VITE_API_BASE_URL=/api
VITE_ENV=development
```

**Si tu backend está en otro puerto:**
```env
# Ejemplo: Backend en http://localhost:8080
VITE_BACKEND_URL=http://localhost:8080
```

**Si tu backend está en otro servidor:**
```env
# Ejemplo: Backend en AWS
VITE_BACKEND_URL=https://api.miempresa.com
```

### Reinicia el servidor después de cambiar `.env.local`:
```bash
npm run dev
```

---

## 🧪 PASO 3: Testear la Conexión

### Opción A: Tests Automáticos (RECOMENDADO)

1. Abre el navegador: `http://localhost:5175`
2. Abre DevTools: `F12`
3. Ve a la pestaña **Console**
4. Copia y pega:

```javascript
// Ejecutar suite completa de tests
await runAllTests()
```

Deberías ver ✅ en verde si todo está bien.

### Opción B: Test Manual

En la consola del navegador (F12 → Console):

```javascript
// Probar si la API responde
fetch('/api/providers')
  .then(r => r.json())
  .then(d => console.log('✅ Conexión ok:', d))
  .catch(e => console.error('❌ Error:', e))
```

---

## 💻 PASO 4: Conectar Componentes

### Ejemplo: Reemplazar mockData en Providers.jsx

**ANTES (con mockData):**
```jsx
import { mockData } from '../data/mockData';

const allCountries = Array.from(
  new Set(mockData.payoutEvents.map(p => p.country))
).sort();
```

**DESPUÉS (con API):**
```jsx
import useProviders from '../hooks/useProviders';

export const Providers = () => {
  const { 
    providers, 
    loading, 
    error, 
    getProvidersByCountry 
  } = useProviders();

  useEffect(() => {
    if (selectedCountry) {
      getProvidersByCountry(selectedCountry);
    }
  }, [selectedCountry, getProvidersByCountry]);

  if (loading) return <Box>Cargando...</Box>;
  if (error) return <Box>Error: {error}</Box>;

  return (
    // Tu componente con providers del backend
  );
};
```

---

## 📡 PASO 5: Estructura de URLs

### Tu frontend hará requests así:

```
Frontend                    Vite Proxy              Backend
(localhost:5175)           (Reescribe)         (localhost:3000)
     │                          │                     │
     ├─ GET /api/providers ────>│ → GET /providers ──>│
     ├─ GET /api/payouts ──────>│ → GET /payouts ───>│
     └─ GET /api/security/score >│ → GET /security... >│
```

**Importantes:**
- ✅ Usa URLs relativas: `/api/...`
- ✅ NO hardcodees: `http://localhost:3000/...`
- ✅ Usa los endpoints definidos en `apiConfig.js`

---

## 🔍 DEBUGGING

### Si hay error en la consola:

#### Error: "Failed to fetch" o "CORS error"
```
💡 Posibles causas:
1. Backend no está corriendo
   → Verifica: npm run dev (en backend)

2. Puerto incorrecto
   → Verifica VITE_BACKEND_URL en .env.local

3. Backend no tiene CORS habilitado
   → Backend debe tener CORS configurado
```

#### Error: "GET /api/providers 404"
```
💡 Posibles causas:
1. El backend no tiene ese endpoint
   → Verifica que existe: /providers (sin /api)

2. Ruta incorrecta en apiConfig.js
   → Verifica PROVIDERS_ENDPOINTS.getAll()
```

#### Error: "Cannot read property 'length' of undefined"
```
💡 Posibles causas:
1. El backend devolvió datos en diferente formato
   → Verifica qué estructura devuelve tu backend

2. No verificaste si loading/error antes de usar data
   → Siempre: if (loading) / if (error)
```

---

## 🌍 PARA PRODUCCIÓN

### 1. Actualiza `.env.production`:
```env
VITE_BACKEND_URL=https://api.tudominio.com
VITE_ENV=production
```

### 2. En tu backend, HABILITA CORS:

**Ejemplo con Node/Express:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://tudominio.com', 'https://www.tudominio.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### 3. Deploy:
```bash
npm run build
# Subir contenido de dist/ a tu servidor
```

---

## 📚 DOCUMENTACIÓN DISPONIBLE

| Archivo | Qué es |
|---------|--------|
| `API_CONFIG.md` | Guía completa de configuración |
| `API_EXAMPLES.js` | Ejemplos de código en componentes |
| `BACKEND_TESTS.js` | Script de testing para consola |
| `CORS_SETUP_SUMMARY.txt` | Resumen visual de setup |
| `vite.config.js` | Configuración del proxy |

---

## ✅ CHECKLIST

- [ ] Backend corriendo en http://localhost:3000 (o puerto configurado)
- [ ] `.env.local` con VITE_BACKEND_URL correcto
- [ ] `npm run dev` reiniciado
- [ ] Tests pasando (runAllTests())
- [ ] Componentes usando hooks (useProviders, usePayouts)
- [ ] Datos del backend mostrándose en UI
- [ ] No hay errores en DevTools Console

---

## 🆘 ¿Necesitas ayuda?

Si algo no funciona, revisa:

1. **Abre DevTools (F12 → Network)**
   - Busca peticiones a `/api/*`
   - Haz click en una, ve **Response** para ver qué devolvió

2. **Abre DevTools (F12 → Console)**
   - Ejecuta: `await runAllTests()`
   - Lee los errores específicos

3. **Verifica Backend:**
   - `curl http://localhost:3000/providers`
   - Debe devolver JSON válido

4. **Verifica Frontend:**
   - `console.log(import.meta.env.VITE_BACKEND_URL)`
   - Debe mostrar la URL correcta

---

## 🎯 RESULTADO FINAL

Una vez todo funcione:

```
Frontend → Proxy (/api) → Backend → Base de Datos
   ↓
Datos reales del backend en tu dashboard
   ✨
```

¡Listo para conectar! 🚀
