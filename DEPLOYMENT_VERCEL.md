# 🚀 Deployment a Vercel - You Know Dashboard

## Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Git configurado
- Repositorio en GitHub/GitLab/Bitbucket

## Paso 1: Preparar el Repositorio

### 1.1 Commitear cambios
```bash
git add .
git commit -m "Preparado para deployment a Vercel"
git push origin main
```

### 1.2 Archivos importantes creados
- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.vercelignore` - Archivos a ignorar
- ✅ `vite.config.js` - Configuración de Vite

## Paso 2: Conectar con Vercel

### Opción A: Desde Dashboard de Vercel (Recomendado)

1. Ir a [vercel.com](https://vercel.com)
2. Click en **"New Project"**
3. Seleccionar tu repositorio GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto Vite
5. Configurar variables de entorno (ver Paso 3)
6. Click en **"Deploy"**

### Opción B: Usar Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deployar (primera vez)
vercel

# Deployar cambios futuros
vercel --prod
```

## Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel, ir a **Project Settings → Environment Variables**

Agregar las siguientes variables para **Production**:

```
VITE_BACKEND_URL = https://tu-backend.com
VITE_API_BASE_URL = /api
VITE_ENV = production
```

⚠️ **IMPORTANTE**: 
- Si usas un backend externo, cambia `VITE_BACKEND_URL` a tu URL real
- Sin variables correctas, el frontend no podrá conectar al backend

## Paso 4: Configuración Automática

Vercel detectará automáticamente:

✅ **Build Command**: `npm run build`  
✅ **Output Directory**: `dist`  
✅ **Node Version**: Automaticamente (v18+)  
✅ **Package Manager**: npm (o tu preferencia)

### Preview antes de producción

Todos los pull requests tendrán URLs de preview automáticamente:
```
https://your-project-pr-123.vercel.app
```

## URLs Post-Deploy

Una vez deployado:

- **Production**: `https://you-know.vercel.app` (o tu dominio custom)
- **Preview**: URLs automáticas en PRs
- **Logs**: En Dashboard de Vercel → Deployments

## Troubleshooting

### ❌ Error: "Build failed"

```
Solución:
1. Revisar logs en Vercel Dashboard → Deployments → Build Logs
2. Asegurar que npm run build funciona localmente:
   npm run build
3. Si hay errores de dependencias:
   npm install
   npm run build
```

### ❌ Error: "Cannot connect to backend"

```
Solución:
1. Verifica que VITE_BACKEND_URL es correcto en Vercel env
2. Backend debe tener CORS habilitado para tu dominio de Vercel
3. Agregar en backend:
   Access-Control-Allow-Origin: https://tu-app.vercel.app
```

### ❌ Error: "404 on page refresh"

```
Solución:
Ya está configurado en vercel.json:
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "/index.html",
      "statusCode": 200
    }
  ]
}
```

## Monitoreo

### Ver logs en tiempo real
```bash
vercel logs --prod
```

### Dashboard de Vercel
- Visitaanalítics en: https://vercel.com/dashboard
- Ver despliegues previos
- Revisar performance
- Configurar dominios custom

## Revertir a versión anterior

En Vercel Dashboard:
1. Ir a **Deployments**
2. Seleccionar deployment anterior
3. Click en **... → Promote to Production**

## Dominio Custom

1. En Vercel Dashboard → Settings → Domains
2. Agregar tu dominio
3. Agregar DNS records según instrucciones
4. Esperar validación (5-48 horas)

## CI/CD Automático

Vercel automáticamente:
- ✅ Detecta cambios en main
- ✅ Ejecuta `npm run build`
- ✅ Despliega automáticamente
- ✅ Genera URLs de preview en PRs
- ✅ Ejecuta checks antes de merging

## Optimizaciones Post-Deploy

### 1. Analytics
En Vercel Dashboard → Analytics (automático)

### 2. Edge Caching
Vercel cachea automáticamente:
- Assets estáticos (CSS, JS)
- Imágenes
- Fontes

### 3. Compresión
Vercel comprime automáticamente:
- JavaScript
- CSS
- HTML

## Checklist Final

- [ ] Variables de entorno configuradas en Vercel
- [ ] Backend responde y tiene CORS habilitado
- [ ] `npm run build` funciona localmente
- [ ] `.gitignore` incluye `.env.local`
- [ ] Repositorio pusheado a GitHub/GitLab/Bitbucket
- [ ] Proyecto conectado a Vercel
- [ ] Deploy completado exitosamente
- [ ] Testeaste URLs de preview y production

## Costo

✅ **Vercel es GRATIS** para:
- Unlimited deployments
- Unlimited preview URLs
- Custom domains
- 100GB bandwidth/mes
- Edge middleware

Premium features (Pro):
- Priority support
- Analytics avanzado
- Team collaboration

## Soporte

- 📖 Docs: https://vercel.com/docs
- 💬 Community: https://vercel.com/support
- 🐛 Issues: GitHub Issues en tu repo

---

**¡Listo para desplegar! 🚀**

```bash
git push origin main
```

Vercel automáticamente detectará cambios y desplegará.
