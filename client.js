const socket = io();

const mesasContainer = document.getElementById('mesas-container');

// Función para formatear el tiempo de segundos a hh:mm:ss
const formatearTiempo = (segundosTotales) => {
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    const horasFormateadas = horas.toString().padStart(2, '0');
    const minutosFormateados = minutos.toString().padStart(2, '0');
    const segundosFormateados = segundos.toString().padStart(2, '0');

    return `${horasFormateadas}:${minutosFormateados}:${segundosFormateados}`;
};

// Función para crear la interfaz de una mesa
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

// Función para actualizar la interfaz con los tiempos de las mesas
socket.on('actualizarTiempos', (mesas) => {
    mesasContainer.innerHTML = '';  // Limpiamos el contenedor antes de actualizar
    for (let mesa in mesas) {
        mesasContainer.innerHTML += crearMesaHTML(mesa, mesas[mesa].tiempo);
    }
});

// Función para enviar el cambio de estado de una mesa al servidor
const cambiarEstadoMesa = (mesa, accion) => {
    socket.emit('cambiarEstadoMesa', { mesa, accion });
};

// Función para agregar una nueva mesa
const agregarMesa = () => {
    socket.emit('agregarMesa');
};

// Función para eliminar la última mesa
const eliminarMesa = () => {
    socket.emit('eliminarMesa');
};

// Función para restablecer el estado al recargar la página
window.onbeforeunload = function() {
    socket.emit('recargarPagina');
};
