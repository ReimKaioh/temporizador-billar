const socket = io();  // Establece la conexión con el servidor

const mesasContainer = document.getElementById('mesas-container');

// Formatear el tiempo en horas, minutos y segundos
const formatearTiempo = (segundosTotales) => {
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    const horasFormateadas = horas.toString().padStart(2, '0');
    const minutosFormateados = minutos.toString().padStart(2, '0');
    const segundosFormateados = segundos.toString().padStart(2, '0');

    return `${horasFormateadas}:${minutosFormateados}:${segundosFormateados}`;
};

// Crear la interfaz de una mesa
const crearMesaHTML = (mesa, tiempo) => {
    return `
        <div class="mesa" id="${mesa}">
            <h2>${mesa}</h2>
            <p>Tiempo: <span id="${mesa}-tiempo">${formatearTiempo(tiempo)}</span></p>
            <button onclick="cambiarEstadoMesa('${mesa}', 'iniciar')">Iniciar</button>
            <button onclick="cambiarEstadoMesa('${mesa}', 'pausar')">Pausar</button>
            <button onclick="cambiarEstadoMesa('${mesa}', 'resetear')">Resetear</button>
        </div>
    `;
};

// Actualizar la interfaz cuando el servidor envía tiempos de las mesas
socket.on('actualizarTiempos', (mesas) => {
    mesasContainer.innerHTML = '';  // Limpiar el contenedor antes de actualizar
    for (let mesa in mesas) {
        mesasContainer.innerHTML += crearMesaHTML(mesa, mesas[mesa].tiempo);
    }
});

// Enviar cambios de estado de una mesa al servidor
const cambiarEstadoMesa = (mesa, accion) => {
    socket.emit('cambiarEstadoMesa', { mesa, accion });
};

// Funciones para agregar o eliminar mesas
const agregarMesa = () => {
    socket.emit('agregarMesa');
};

const eliminarMesa = () => {
    socket.emit('eliminarMesa');
};

// Restablecer el estado cuando se recarga la página
window.onbeforeunload = function() {
    socket.emit('recargarPagina');
};
