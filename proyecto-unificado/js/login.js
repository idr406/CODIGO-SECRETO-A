console.log("loginjs")

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    const error = document.querySelector('.error');
    
    if (!user || !password) {
        error.classList.remove('escondido');
        error.textContent = 'Por favor completa todos los campos';
        return;
    }
    
    // Simulación de login (en producción conectar con backend)
    if (user && password) {
        window.location.href = 'admin.html';
    } else {
        error.classList.remove('escondido');
        error.textContent = 'Usuario o contraseña incorrectos';
    }
});
