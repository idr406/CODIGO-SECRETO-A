console.log("adminjs")

function cerrarSesion() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        window.location.href = 'login.html';
    }
}
