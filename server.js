const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types para diferentes archivos
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parsear la URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Si es la raíz, servir index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construir la ruta del archivo
    const filePath = path.join(__dirname, pathname);
    
    // Verificar si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Archivo no encontrado
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Archivo no encontrado</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #e74c3c; }
                    </style>
                </head>
                <body>
                    <h1 class="error">404 - Archivo no encontrado</h1>
                    <p>El archivo <code>${pathname}</code> no existe.</p>
                    <a href="/">← Volver al inicio</a>
                </body>
                </html>
            `);
            return;
        }
        
        // Leer el archivo
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>500 - Error del servidor</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .error { color: #e74c3c; }
                        </style>
                    </head>
                    <body>
                        <h1 class="error">500 - Error del servidor</h1>
                        <p>Error al leer el archivo: ${err.message}</p>
                        <a href="/">← Volver al inicio</a>
                    </body>
                    </html>
                `);
                return;
            }
            
            // Determinar el tipo de contenido
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            // Configurar headers
            const headers = {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            };
            
            // Headers adicionales para archivos JavaScript
            if (ext === '.js') {
                headers['Content-Type'] = 'text/javascript; charset=utf-8';
            }
            
            // Headers adicionales para archivos CSS
            if (ext === '.css') {
                headers['Content-Type'] = 'text/css; charset=utf-8';
            }
            
            res.writeHead(200, headers);
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor HVC Tracker iniciado en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
    console.log(`⏰ Iniciado el: ${new Date().toLocaleString()}`);
    console.log(`\n🌐 Abre tu navegador en: http://localhost:${PORT}`);
    console.log(`\n💡 Para detener el servidor presiona Ctrl+C\n`);
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    console.log('\n🛑 Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
    console.error('💥 Error no capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesa rechazada no manejada:', reason);
    process.exit(1);
});
