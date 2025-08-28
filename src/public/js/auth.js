
// Lógica de alternar formulários
document.addEventListener('DOMContentLoaded', () => {

    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showRegisterBtn2 = document.getElementById('showRegisterBtn2');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeText = document.getElementById('welcomeText');
    const authLeft = document.getElementById('authLeft');


    // Envio do formulário
    const authform = document.getElementById('registerForm');

    authform.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const senha = document.getElementById('registerPassword').value;
        const confirmarSenha = document.getElementById('confirmPassword').value;

        const data = {
            nome,
            email,
            senha,
            confirmarSenha,
        };

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            
            console.log(result);

        } catch (error) {
            console.error('Erro:', error);
        }
    });
});