# 🚀 Guía de Configuración de Deployment

## 📋 Configuración de Variables de Entorno en Vercel

### ✅ Configuración CORRECTA

Para que el frontend funcione correctamente en Vercel, debes configurar la siguiente variable de entorno:

**Variable:**
```
NEXT_PUBLIC_API_URL=https://testadminback.onrender.com/api
```

⚠️ **IMPORTANTE:** La URL debe incluir `/api` al final.

### 🔧 Cómo Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Environment Variables**
4. Agrega la variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://testadminback.onrender.com/api`
   - **Environment:** Selecciona `Production`, `Preview` y `Development`
5. Click en **Save**
6. Redeploy tu aplicación

### 📊 Cómo Funciona

#### Backend (NestJS)
El backend tiene configurado un prefijo global en `main.ts`:
```typescript
app.setGlobalPrefix('api');
```

Esto significa que todas las rutas tienen el prefijo `/api`:
- `/api/auth/login`
- `/api/auth/register`
- `/api/products`
- `/api/categories`
- etc.

#### Frontend (Next.js)

**En desarrollo local:**
- `API_BASE_URL = '/api'` (valor por defecto)
- `endpoint = '/auth/login'`
- **URL construida:** `/api/auth/login`
- **Next.js rewrite:** Redirige a `https://testadminback.onrender.com/api/auth/login` ✅

**En producción (Vercel):**
- `API_BASE_URL = 'https://testadminback.onrender.com/api'` (variable de entorno)
- `endpoint = '/auth/login'`
- **URL construida:** `https://testadminback.onrender.com/api/auth/login` ✅

### 🎯 Resultado Final

Con esta configuración:
- ✅ Login funciona correctamente
- ✅ Register funciona correctamente
- ✅ Todas las demás rutas funcionan correctamente
- ✅ No hay duplicación de `/api` en las URLs
- ✅ El código es limpio y sigue buenas prácticas

### 🔍 Verificación

Para verificar que todo está correcto, revisa en las DevTools del navegador que las peticiones se hacen a:
```
https://testadminback.onrender.com/api/auth/login
https://testadminback.onrender.com/api/auth/register
https://testadminback.onrender.com/api/products
```

Y NO a:
```
❌ https://testadminback.onrender.com/api/api/auth/login
❌ https://testadminback.onrender.com/auth/login
```

### 📝 Notas Adicionales

- El archivo `next.config.js` tiene un rewrite que solo funciona en desarrollo local
- En producción en Vercel, se usa directamente la variable de entorno
- No necesitas modificar el `next.config.js` para el deployment
