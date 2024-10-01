// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Estado inicial de las mesas
let mesasIniciales = {
    mesa1: { tiempo: 0, enUso: false },
    mesa2: { tiempo: 0, enUso: false },
    mesa3: { tiempo: 0, enUso: false }
};

// Estado actual de las mesas, que se restablece al estado inicial al reiniciar
let mesas = { ...mesasIniciales };

// Función para generar nombres de mesas nuevos
const generarNombreMesa = () => {
    const numeroMesas = Object.keys(mesas).length + 1;
    return `mesa${numeroMesas}`;
};

// Incrementa el tiempo de las mesas que están en uso cada segundo
setInterval(() => {
    for (let mesa in mesas) {
        if (mesas[mesa].enUso) {
            mesas[mesa].tiempo++;
        }
    }
    io.emit('actualizarTiempos', mesas);
}, 1000);

// Sirve archivos estáticos desde la carpeta 'public'
app.use(express.static(__dirname + '/public'));

// Manejamos las conexiones del cliente
io.on('connection', (socket) => {
    // Enviar el estado inicial de las mesas cuando un cliente se conecta
    socket.emit('actualizarTiempos', mesas);

    // Escuchar eventos para agregar, eliminar o cambiar el estado de las mesas
    socket.on('cambiarEstadoMesa', ({ mesa, accion }) => {
        if (mesas[mesa]) {
            switch (accion) {
                case 'iniciar':
                    mesas[mesa].enUso = true;
                    break;
                case 'pausar':
                    mesas[mesa].enUso = false;
                    break;
                case 'resetear':
                    mesas[mesa].tiempo = 0;
                    mesas[mesa].enUso = false;
                    break;
            }
            io.emit('actualizarTiempos', mesas);
        }
    });

    // Agregar una nueva mesa
    socket.on('agregarMesa', () => {
        const nuevaMesa = generarNombreMesa();
        mesas[nuevaMesa] = { tiempo: 0, enUso: false };
        io.emit('actualizarTiempos', mesas);
    });

    // Eliminar la última mesa
    socket.on('eliminarMesa', () => {
        const nombresMesas = Object.keys(mesas);
        if (nombresMesas.length > 1) {  // Mantenemos al menos una mesa
            const ultimaMesa = nombresMesas[nombresMesas.length - 1];
            delete mesas[ultimaMesa];
            io.emit('actualizarTiempos', mesas);
        }
    });

    // Restablecer el estado de las mesas cuando el cliente recarga la página
    socket.on('recargarPagina', () => {
        mesas = { ...mesasIniciales };  // Restablece las mesas al estado inicial
        io.emit('actualizarTiempos', mesas);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
