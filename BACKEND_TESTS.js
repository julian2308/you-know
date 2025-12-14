/**
 * Script de Testing para verificar conexión con el backend
 * Ejecutar en la consola del navegador (F12 → Console)
 */

// ============================================
// TEST 1: Verificar que apiClient está disponible
// ============================================
async function testApiClient() {
  console.log('🔍 Test 1: Verificando apiClient...');
  try {
    const { apiClient, PROVIDERS_ENDPOINTS } = await import('/src/config/apiConfig.js');
    console.log('✅ apiClient importado correctamente');
    return true;
  } catch (err) {
    console.error('❌ Error al importar apiClient:', err);
    return false;
  }
}

// ============================================
// TEST 2: Probar conexión básica a /api
// ============================================
async function testBackendConnection() {
  console.log('\n🔍 Test 2: Verificando conexión con backend...');
  try {
    const response = await fetch('/api/providers');
    if (response.ok) {
      console.log('✅ Backend responde en /api/providers');
      const data = await response.json();
      console.log('📊 Datos recibidos:', data.length, 'providers');
      return true;
    } else {
      console.error('❌ Backend respondió con error:', response.status, response.statusText);
      return false;
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
    console.log('💡 Tip: Verifica que:');
    console.log('   1. El backend esté corriendo en http://localhost:3000');
    console.log('   2. VITE_BACKEND_URL esté correcto en .env.local');
    console.log('   3. Reiniciaste npm run dev después de cambiar .env.local');
    return false;
  }
}

// ============================================
// TEST 3: Probar endpoint específico
// ============================================
async function testSpecificEndpoint(endpoint) {
  console.log(`\n🔍 Test 3: Probando endpoint: ${endpoint}`);
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${endpoint} respondió correctamente`);
      console.log('📊 Datos:', data);
      return true;
    } else {
      console.error(`❌ ${endpoint} error: ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error al acceder a ${endpoint}:`, err.message);
    return false;
  }
}

// ============================================
// TEST 4: Probar petición POST (cuando esté disponible)
// ============================================
async function testPostEndpoint(endpoint, data) {
  console.log(`\n🔍 Test 4: Probando POST a: ${endpoint}`);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ POST a ${endpoint} exitoso`);
      console.log('📊 Respuesta:', result);
      return true;
    } else {
      console.error(`❌ POST a ${endpoint} error: ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error en POST a ${endpoint}:`, err.message);
    return false;
  }
}

// ============================================
// TEST 5: Verificar variables de entorno
// ============================================
async function testEnvironmentVariables() {
  console.log('\n🔍 Test 5: Verificando variables de entorno...');
  
  console.log('import.meta.env.VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL || 'NO DEFINIDO');
  console.log('import.meta.env.VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NO DEFINIDO');
  console.log('import.meta.env.VITE_ENV:', import.meta.env.VITE_ENV || 'NO DEFINIDO');
  
  if (import.meta.env.VITE_BACKEND_URL) {
    console.log('✅ Variables de entorno configuradas correctamente');
    return true;
  } else {
    console.error('❌ Variables de entorno no configuradas');
    console.log('💡 Crea/actualiza .env.local con:');
    console.log('   VITE_BACKEND_URL=http://localhost:3000');
    return false;
  }
}

// ============================================
// SUITE COMPLETA DE TESTS
// ============================================
async function runAllTests() {
  console.clear();
  console.log('═'.repeat(50));
  console.log('        SUITE DE TESTS - CONEXIÓN A BACKEND');
  console.log('═'.repeat(50));
  
  const results = {
    test1: await testApiClient(),
    test2: await testEnvironmentVariables(),
    test3: await testBackendConnection(),
  };
  
  console.log('\n' + '═'.repeat(50));
  console.log('                   RESUMEN');
  console.log('═'.repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  console.log(`\n✅ Tests pasados: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ¡TODO ESTÁ FUNCIONANDO CORRECTAMENTE!');
    console.log('\nProximos pasos:');
    console.log('1. Abre los componentes (Dashboard, Providers)');
    console.log('2. Reemplaza mockData con los hooks (useProviders, usePayouts)');
    console.log('3. Verifica que los datos lleguen del backend');
  } else {
    console.log('\n⚠️  Hay problemas. Revisa los errores arriba.');
  }
}

// ============================================
// COMANDOS RÁPIDOS PARA LA CONSOLA
// ============================================
console.log(`
╔══════════════════════════════════════════════════════╗
║           TESTING DE CONEXIÓN A BACKEND             ║
╚══════════════════════════════════════════════════════╝

Para ejecutar tests, copia y pega en la consola:

1️⃣  Verificar todo:
    await runAllTests()

2️⃣  Probar endpoint específico:
    await testSpecificEndpoint('/api/providers')
    await testSpecificEndpoint('/api/payouts')

3️⃣  Hacer petición GET manual:
    fetch('/api/providers').then(r => r.json()).then(d => console.log(d))

4️⃣  Hacer petición POST manual:
    fetch('/api/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' })
    }).then(r => r.json()).then(d => console.log(d))

5️⃣  Ver variables de entorno:
    console.table({
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_ENV: import.meta.env.VITE_ENV,
    })

💡 TIPS PARA DEBUGGING:
  • F12 → Network: Ver todas las peticiones HTTP
  • F12 → Console: Ver errores y logs
  • Ctrl+Shift+Delete: Limpiar cache si tenés problemas
  • Reinicia npm run dev después de cambiar .env.local
`);

// Auto-ejecutar si estás en desarrollo
if (import.meta.env.VITE_ENV === 'development') {
  console.log('\n⚡ Ambiente: DEVELOPMENT - Ejecuta runAllTests() para comenzar');
}
