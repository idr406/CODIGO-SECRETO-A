console.log("registerjs")

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('user').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const error = document.querySelector('.error');
    
    if (!user || !email || !password) {
        error.classList.remove('escondido');
        error.textContent = 'Por favor completa todos los campos';
        return;
    }
    
    // Simulación de registro (en producción conectar con backend)
    alert('Usuario registrado correctamente');
    window.location.href = 'login.html';
});
