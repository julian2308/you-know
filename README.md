# You Know - Dashboard Inteligente de Pagos

## Concepto

**You Know** es una solución profesional diseñado para empresas de procesamiento de pagos (como Yuno) que implementan **sistemas de auto-enrutamiento inteligente**. Transforma datos técnicos complejos en términos simples y comprensibles para usuarios de negocio.

### Misión
Simplificar la complejidad del procesamiento de pagos internacionales y el auto-enrutamiento de transacciones, permitiendo que los usuarios entiendan:
- **Por qué** se enruta cada pago a través de una ruta específica
- **Cómo** optimiza automáticamente la tasa de éxito
- **Qué** hacer cuando algo no funciona

## Características Principales

### 1. **KPIs Simplificados**
- **Transacciones**: Total de operaciones procesadas
- **Tasa de Éxito**: Porcentaje de transacciones aprobadas
- **Volumen Total**: Dinero procesado en términos reales
- **Velocidad Promedio**: Tiempo que tarda el sistema

### 2. **Estrategia de Enrutamiento Visualizada**
Barra de progreso que muestra intuitivamente cómo se distribuyen las transacciones entre rutas.

### 3. **Estado de Seguridad**
- Score de Seguridad calculado dinámicamente (A+, A, B, etc.)
- Certificaciones activas (PCI DSS 3.2.1)
- Cálculo basado en: tasa éxito, validaciones de riesgo, latencia, diversificación

### 4. **Panel de Alertas Inteligentes**
- Alertas automáticas por proveedor
- Severidad dinámica (Crítico, Advertencia, Info)
- Acciones recomendadas específicas por tipo de error
- Expandible para ver detalles y payouts afectados
- Se actualiza basado en el security score

## Páginas

1. **Dashboard general** - Vista general con KPIs y estado del sistema
2. **Centro de Alertas** - Monitoreo centralizado de problemas por proveedor
3. **Providers** - Monitoreo centralizado de transacciones filtrado por proveedor y país.
4. **Merchants** - Monitoreo centralizado de transacciones del Merchant filtrado por rango de fechas, problemáticas en tiempo real y posibles soluciones accionables.

 ## Backend & Arquitectura de Datos 

You Know se apoya en un backend independiente encargado de centralizar eventos de pago, generar métricas agregadas y habilitar alertas inteligentes en tiempo (casi) real.

El frontend no calcula lógica crítica: toda la inteligencia de negocio proviene del backend.

## Rol del Backend

El backend es responsable de:

- Ingestar eventos técnicos de pagos (logs, fallos, latencias)

- Persistir información histórica para análisis

- Detectar anomalías por:

1. Proveedor
2. País
3. Merchant
4. Ventana de tiempo

- Exponer insights listos para negocio

- Alimentar el dashboard y el sistema de alertas

## API Overview

Base URL
```
https://preearthquake-shinily-lorenza.ngrok-free.dev/api
```

### GET /overview

Retorna métricas agregadas del sistema para el dashboard principal.

Query params
```
from=ISO_DATE_TIME
to=ISO_DATE_TIME
```

Ejemplo

`GET /api/overview?from=2025-12-13T00:00:00&to=2025-12-14T00:00:00`


Usado en:

- KPIs principales

- Routing strategy

- Security score

- Estado general del sistema

### GET /eventos

Obtiene eventos detallados para análisis y drill-down.

Query params
```
from=ISO_DATE_TIME
to=ISO_DATE_TIME
```

Usado en:

- Centro de Alertas

- Vista por Provider

- Vista por Merchant

- Detección de patrones de fallo

### POST /events

Ingesta eventos de pago en lote.

Body
```
    "merchantId": "shopito",
    "countryCode": "MX",
    "provider": "Stripe",
    "status": "FAILED",
    "errorType": "TIMEOUT",
    "latency": 3200,
    "timestamp": "2025-12-14T01:15:00"
```


Usado para:

- Simulación de tráfico

- Alimentación desde sistemas externos

- Pruebas de alertas y routing

## Diagrama de Arquitectura

<img width="1461" height="690" alt="image" src="https://github.com/user-attachments/assets/4f182022-c2d7-47a6-9d78-7eeab56cdc6a" />


## Tiempo (Casi) Real

El frontend se actualiza automáticamente cuando hay nuevos eventos relevantes:

- Nuevos errores

- Cambios en tasas de éxito

- Activación de alertas

Esto se logra mediante el uso de WebSockets sin necesidad de refrescar la página, permitiendo que podamos obtener la actualización de alertas relevantes para nuestros clientes y proveedores.

## Decisiones Técnicas Clave

### Backend desacoplado del Frontend

El backend y el frontend se desarrollaron en repositorios separados para:

- Facilitar el despliegue independiente

- Permitir escalar y evolucionar cada componente sin fricción

- Simular un entorno real de integración (como en producción)

### Modelo basado en eventos

Se optó por un modelo de datos orientado a eventos de pago en lugar de métricas precalculadas para:

- Permitir análisis histórico flexible

- Detectar patrones (fallos consecutivos, ventanas de tiempo)

- Generar insights dinámicos y alertas en tiempo real

### API REST como contrato

La comunicación Front–Back se realiza mediante una API REST clara y explícita, lo que:

- Define un contrato estable entre capas

- Permite validar fácilmente la integración

- Hace posible consumir el backend desde cualquier cliente

### WebSockets para actualización en tiempo real

Se integran WebSockets para:

- Refrescar métricas y alertas sin recargar la página

- Mantener estabilidad en la UX sin “reordenar” tablas

- Simular escenarios reales de monitoreo operativo

### Enfoque Business-First

Las decisiones técnicas priorizan que:

- Los datos técnicos se traduzcan en insights accionables

- El dashboard sea entendible para perfiles no técnicos

- Cada alerta tenga contexto y recomendación clara


## Cómo correr el proyecto...?


### ¿Qué es Ngrok?

**Ngrok** es una herramienta que crea túneles seguros desde internet público hacia servicios locales en tu máquina. Es ideal para:
- Desarrollo web y testing
- Webhooks
- Demostraciones en vivo
- Acceso remoto temporal

---

### Requisitos Previos

- **Sistema Operativo:** Windows 7 o superior
- **Conexión a Internet**
- **Permisos de Administrador** (recomendado)

---

### Métodos de Instalación

### **Método 1: Descarga Directa** *(Recomendado)*

#### **Paso 1: Descargar Ngrok**
1. Visita el sitio oficial: [https://ngrok.com/download](https://ngrok.com/download)
2. Selecciona la versión para **Windows (64-bit)**
3. Descarga el archivo ``ngrok.zip``

#### **Paso 2: Extraer el Archivo**
1. Localiza el archivo ``ngrok.zip`` en tu carpeta de descargas
2. Haz clic derecho → **Extraer todo...**
3. Elige una ubicación (recomendado: ``C:\ngrok`` o ``C:\Program Files\ngrok``)

#### **Paso 3: Agregar Ngrok al PATH** *(Opcional pero recomendado)*
1. Presiona ``Win + X`` → **Sistema**
2. Click en **Configuración avanzada del sistema**
3. Click en **Variables de entorno**
4. En **Variables del sistema**, selecciona ``Path`` → **Editar**
5. Click en **Nuevo** y agrega la ruta: ``C:\ngrok``
6. Click **Aceptar** en todas las ventanas

#### **Paso 4: Registrarse y Obtener Token**
1. Crea una cuenta gratuita en: [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Inicia sesión en tu **Dashboard**
3. Copia tu **authtoken** desde la sección "*Your Authtoken*"

#### **Paso 5: Configurar el Authtoken**
Abre **CMD** o **PowerShell** y ejecuta:

```
ngrok config add-authtoken TU_TOKEN_AQUI
```

## Método 2: Instalación con Chocolatey

Si tienes **Chocolatey** instalado, ejecuta en PowerShell (como administrador):
```
choco install ngrok
```
## Método 3: Instalación con Scoop

Si usas **Scoop**, ejecuta:
```
scoop bucket add extras
scoop install ngrok
```
## Uso Básico

### Exponer un Puerto HTTP

Para exponer un servidor local en el puerto 8080:
```
ngrok http 8080
```
### Exponer un Puerto Específico con Dominio Personalizado
```
ngrok http --domain=tu-dominio.ngrok.io 8080
```
### Exponer un Puerto TCP
```
ngrok tcp 3389
```
### Exponer un Sitio HTTPS Local
```
ngrok http https://localhost:443
```
### Túnel con Autenticación Básica
```
ngrok http 8080 --basic-auth "usuario:contraseña"
```
## Interfaz Web de Ngrok

Cuando ejecutas ngrok, automáticamente se abre una interfaz web en:

http://127.0.0.1:4040

Desde aquí puedes:
- ✅ Ver todas las peticiones HTTP
- ✅ Inspeccionar headers y body
- ✅ Reenviar peticiones
- ✅ Ver estadísticas en tiempo real

## Tech Stack (Backend)

Java + Spring Boot

REST API

Base de datos relacional

DTOs orientados a negocio

Diseño preparado para escalar reglas de alertas

## Objetivo del Diseño

El backend está diseñado para responder preguntas como:

- ¿Qué proveedor está fallando ahora mismo?

- ¿Qué país bajó conversión hoy?

- ¿Cuántos fallos consecutivos disparan una alerta?

- ¿Qué acción debería tomar el equipo de negocio?

Todo sin que el usuario tenga que leer logs ni métricas técnicas.


