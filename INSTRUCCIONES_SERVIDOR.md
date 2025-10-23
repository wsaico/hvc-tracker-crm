# 🚀 HVC Tracker - Instrucciones del Servidor

## ✅ Problema Resuelto

El problema era que **no había un servidor de desarrollo configurado** para servir la aplicación en `localhost:3000`.

## 🔧 Solución Implementada

He creado un servidor Node.js simple que:
- ✅ Sirve la aplicación en `http://localhost:3000`
- ✅ Maneja archivos estáticos (HTML, CSS, JS)
- ✅ Configura MIME types correctos
- ✅ Incluye manejo de errores 404/500
- ✅ Headers de cache optimizados para desarrollo

## 🚀 Cómo Usar

### Opción 1: Usando npm (Recomendado)
```bash
# Iniciar servidor
npm start
# o
npm run dev
```

### Opción 2: Usando Node.js directamente
```bash
# Iniciar servidor
node server.js
```

## 🌐 Acceso a la Aplicación

Una vez iniciado el servidor, abre tu navegador en:
**http://localhost:3000**

## 📁 Archivos Creados

1. **`server.js`** - Servidor HTTP simple
2. **`package.json`** - Configuración del proyecto
3. **`INSTRUCCIONES_SERVIDOR.md`** - Este archivo

## 🔍 Verificación

El servidor está funcionando si ves:
```
🚀 Servidor HVC Tracker iniciado en http://localhost:3000
📁 Sirviendo archivos desde: E:\WILLY\hvc-tracker
⏰ Iniciado el: [fecha y hora]
```

## 🛑 Detener el Servidor

Presiona `Ctrl+C` en la terminal donde está corriendo el servidor.

## 🔧 Características del Servidor

- **Puerto**: 3000 (configurable en `server.js`)
- **MIME Types**: Configurados para HTML, CSS, JS, imágenes, PDF
- **Cache**: Deshabilitado para desarrollo
- **Errores**: Páginas 404/500 personalizadas
- **Logs**: Muestra cada request en consola

## 🚨 Solución de Problemas

### Si el puerto 3000 está ocupado:
1. Cambia el puerto en `server.js` (línea 5: `const PORT = 3000;`)
2. O mata el proceso que usa el puerto:
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID [número_del_proceso] /F
   ```

### Si no se ve la aplicación:
1. Verifica que el servidor esté corriendo
2. Abre `http://localhost:3000` (no `localhost:3000` sin http)
3. Revisa la consola del navegador para errores
4. Verifica que `index.html` existe en la raíz del proyecto

## 📞 Soporte

Si tienes problemas, revisa:
1. ✅ Node.js instalado (`node --version`)
2. ✅ Puerto 3000 disponible
3. ✅ Archivo `index.html` en la raíz
4. ✅ Consola del navegador para errores JavaScript
