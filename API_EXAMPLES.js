/**
 * EJEMPLO DE INTEGRACIÓN CON API
 * Este archivo muestra cómo usar los hooks y la configuración de API
 * en componentes reales de la aplicación
 */

// ============================================
// 1. IMPORTAR HOOKS Y CONFIG
// ============================================
import { useState, useEffect } from 'react';
import useProviders from '../hooks/useProviders';
import usePayouts from '../hooks/usePayouts';
import { apiClient, PROVIDERS_ENDPOINTS } from '../config/apiConfig';

// ============================================
// 2. EJEMPLO 1: Usar useProviders Hook
// ============================================
export const ProviderExampleComponent = ({ country }) => {
  const { 
    providers, 
    loading, 
    error, 
    getProvidersByCountry 
  } = useProviders();

  useEffect(() => {
    if (country) {
      getProvidersByCountry(country);
    }
  }, [country, getProvidersByCountry]);

  if (loading) return <div>Cargando providers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Providers en {country}</h2>
      <ul>
        {providers.map((provider) => (
          <li key={provider.id}>{provider.name}</li>
        ))}
      </ul>
    </div>
  );
};

// ============================================
// 3. EJEMPLO 2: Usar usePayouts Hook
// ============================================
export const PayoutsExampleComponent = ({ country, provider }) => {
  const { 
    payouts, 
    loading, 
    error, 
    getPayoutsByCountryAndProvider 
  } = usePayouts();

  useEffect(() => {
    if (country && provider) {
      getPayoutsByCountryAndProvider(country, provider);
    }
  }, [country, provider, getPayoutsByCountryAndProvider]);

  if (loading) return <div>Cargando payouts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Payouts: {provider} en {country}</h2>
      <p>Total: {payouts.length} transacciones</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.id}>
              <td>{payout.id}</td>
              <td>${payout.amount}</td>
              <td>{payout.status}</td>
              <td>{new Date(payout.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// 4. EJEMPLO 3: Usar apiClient Directamente
// ============================================
export const DirectAPICallExample = ({ providerId }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!providerId) return;

    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(
          PROVIDERS_ENDPOINTS.getMetrics(providerId)
        );
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [providerId]);

  if (loading) return <div>Cargando métricas...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!metrics) return null;

  return (
    <div>
      <h2>Métricas del Provider</h2>
      <div>
        <p>Success Rate: {metrics.successRate}%</p>
        <p>Total Payouts: {metrics.totalPayouts}</p>
        <p>Volume: ${metrics.totalVolume}</p>
      </div>
    </div>
  );
};

// ============================================
// 5. EJEMPLO 4: Petición POST (para datos futuros)
// ============================================
export const PostExampleComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.post(
        '/api/providers',
        formData
      );
      console.log('Provider creado:', result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleSubmit({ name: 'Test' })}>
        {loading ? 'Enviando...' : 'Crear Provider'}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
};

// ============================================
// 6. EJEMPLO 5: Patrón de Filtro en Cascada (País → Provider → Payouts)
// ============================================
export const CascadeFilterExample = () => {
  const [country, setCountry] = useState('');
  const [provider, setProvider] = useState('');
  
  const { 
    providers, 
    getProvidersByCountry 
  } = useProviders();
  
  const { 
    payouts, 
    getPayoutsByCountryAndProvider 
  } = usePayouts();

  // Cuando el país cambia, obtener providers
  const handleCountryChange = async (newCountry) => {
    setCountry(newCountry);
    setProvider(''); // Reset provider
    if (newCountry) {
      await getProvidersByCountry(newCountry);
    }
  };

  // Cuando el provider cambia, obtener payouts
  const handleProviderChange = async (newProvider) => {
    setProvider(newProvider);
    if (country && newProvider) {
      await getPayoutsByCountryAndProvider(country, newProvider);
    }
  };

  return (
    <div>
      <h2>Filtro en Cascada</h2>
      
      <div>
        <label>País:</label>
        <select value={country} onChange={(e) => handleCountryChange(e.target.value)}>
          <option value="">Selecciona país</option>
          <option value="MX">México</option>
          <option value="BR">Brasil</option>
          <option value="AR">Argentina</option>
        </select>
      </div>

      <div>
        <label>Provider:</label>
        <select 
          value={provider} 
          onChange={(e) => handleProviderChange(e.target.value)}
          disabled={!country}
        >
          <option value="">Selecciona provider</option>
          {providers.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {payouts.length > 0 && (
        <div>
          <h3>Payouts: {payouts.length}</h3>
          {/* Mostrar payouts aquí */}
        </div>
      )}
    </div>
  );
};

// ============================================
// 7. MANEJO DE ERRORES COMÚN
// ============================================
export const ErrorHandlingExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/providers');
      setData(response);
    } catch (err) {
      // Manejo de diferentes tipos de error
      if (err.message.includes('404')) {
        setError('Recurso no encontrado');
      } else if (err.message.includes('500')) {
        setError('Error del servidor');
      } else if (err.message.includes('Failed to fetch')) {
        setError('No se puede conectar al servidor. Verifica que está corriendo.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>{loading ? 'Cargando...' : 'Cargar'}</button>
      {error && <div style={{ color: 'red' }}>⚠️ {error}</div>}
      {data && <div>✓ Datos cargados correctamente</div>}
    </div>
  );
};

// ============================================
// TIPS Y BUENAS PRÁCTICAS
// ============================================
/*
1. SIEMPRE IMPORTA DEL CONFIG:
   ✓ import { PROVIDERS_ENDPOINTS } from '../config/apiConfig';
   ✗ Evita hardcodear URLs como '/api/providers'

2. USA HOOKS CUANDO PUEDAS:
   ✓ const { providers, getProvidersByCountry } = useProviders();
   ✗ Evita hacer fetch directamente en useEffect

3. MANEJA ESTADOS:
   - loading: Mientras se obtienen datos
   - error: Para errores de la petición
   - data: Los datos obtenidos

4. RESETEA FILTROS EN CASCADA:
   Cuando el filtro padre cambia, resetea el hijo:
   ```
   setProviderFilter('');
   ```

5. EN PRODUCCIÓN:
   - Actualiza VITE_BACKEND_URL en .env.production
   - Habilita CORS en tu backend
   - Usa HTTPS

6. PARA DEBUGGING:
   - Abre DevTools (F12)
   - Ve a la pestaña "Network"
   - Verifica que las peticiones lleguen a /api/...
   - En Network, haz click en la petición y ve detalles
*/
