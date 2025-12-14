#!/bin/bash

# Script para preparar deploy a Vercel
# Ejecutar: bash deploy-vercel.sh

echo "════════════════════════════════════════════════════"
echo "  🚀 PREPARANDO DEPLOY A VERCEL - YOU KNOW"
echo "════════════════════════════════════════════════════"
echo ""

# Step 1: Verificar que npm run build funciona
echo "1️⃣  Verificando que la build es correcta..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error en la build. Revisa los errores arriba."
    exit 1
fi
echo "✅ Build exitosa"
echo ""

# Step 2: Verificar git status
echo "2️⃣  Verificando estado de git..."
git status
echo ""

# Step 3: Commitear cambios
echo "3️⃣  Commitendo cambios..."
read -p "¿Descripción del commit? (presiona Enter para saltar): " commit_msg
if [ -n "$commit_msg" ]; then
    git add .
    git commit -m "$commit_msg"
    echo "✅ Cambios commiteados"
else
    echo "⏭️  Commit saltado"
fi
echo ""

# Step 4: Push
echo "4️⃣  ¿Push a GitHub? (s/n)"
read -p "Respuesta: " push_confirm
if [ "$push_confirm" = "s" ] || [ "$push_confirm" = "S" ]; then
    git push origin main
    echo "✅ Push completado"
else
    echo "⏭️  Push saltado"
fi
echo ""

# Step 5: Instrucciones
echo "════════════════════════════════════════════════════"
echo "  ✨ PRÓXIMOS PASOS"
echo "════════════════════════════════════════════════════"
echo ""
echo "1. Ve a https://vercel.com/dashboard"
echo "2. Click en 'New Project'"
echo "3. Selecciona tu repositorio"
echo "4. En Environment Variables, agregar:"
echo "   - VITE_BACKEND_URL = https://tu-backend.com"
echo "   - VITE_API_BASE_URL = /api"
echo "   - VITE_ENV = production"
echo "5. Click en 'Deploy'"
echo ""
echo "¡Tu app estará en vivo en minutos! 🎉"
echo ""
