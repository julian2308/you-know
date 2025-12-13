# You Know - Dashboard Inteligente de Pagos

## 🎯 Concepto

**You Know** es un dashboard profesional diseñado para empresas de procesamiento de pagos (como Yuno) que implementan **sistemas de auto-enrutamiento inteligente**. Transforma datos técnicos complejos en términos simples y comprensibles para usuarios de negocio.

### Misión
Simplificar la complejidad del procesamiento de pagos internacionales y el auto-enrutamiento de transacciones, permitiendo que los usuarios entiendan:
- **Por qué** se enruta cada pago a través de una ruta específica
- **Cómo** optimiza automáticamente la tasa de éxito
- **Qué** hacer cuando algo no funciona

## 🚀 Características Principales

### 1. **Sistema de Auto-Enrutamiento Inteligente**
- **Ruta Primaria (92%)**: Visa/Mastercard - Proveedores principales de alto volumen
- **Ruta Secundaria (6%)**: Proveedores alternativos para casos especiales o fallos
- **Ruta Terciaria (2%)**: Backup de emergencia para máxima confiabilidad

El sistema automáticamente selecciona la mejor ruta en tiempo real basado en:
- Tasa de éxito histórica del proveedor
- Disponibilidad de la red
- Riesgo de la transacción
- Ubicación geográfica

### 2. **KPIs Simplificados**
- **Transacciones**: Total de operaciones procesadas
- **Tasa de Éxito**: Porcentaje de transacciones aprobadas
- **Volumen Total**: Dinero procesado en términos reales
- **Velocidad Promedio**: Tiempo que tarda el sistema

### 3. **Estrategia de Enrutamiento Visualizada**
Barra de progreso que muestra intuitivamente cómo se distribuyen las transacciones entre rutas.

### 4. **Estado de Seguridad**
- Score de Seguridad calculado dinámicamente (A+, A, B, etc.)
- Certificaciones activas (PCI DSS 3.2.1)
- Cálculo basado en: tasa éxito, validaciones de riesgo, latencia, diversificación

### 5. **Panel de Alertas Inteligentes**
- Alertas automáticas por proveedor
- Severidad dinámica (Crítico, Advertencia, Info)
- Acciones recomendadas específicas por tipo de error
- Expandible para ver detalles y payouts afectados
- Se actualiza basado en el security score

## � Páginas

1. **Dashboard** - Vista general con KPIs y estado del sistema
2. **Centro de Alertas** - Monitoreo centralizado de problemas por proveedor

## �📊 Tech Stack

- **Frontend**: React 19.2 + Vite
- **UI Library**: Material-UI 7.3
- **Charts**: Recharts 3.5 (próximamente integrados)
- **Routing**: React Router 7.10
- **Icons**: Material-UI Icons
- **Theme**: Sistema de temas personalizado

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
