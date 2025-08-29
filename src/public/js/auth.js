
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmpassword = document.getElementById('confirmPassword').value;

            const data = {
                name,
                email,
                password,
                confirmpassword,
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
                
                if (response.ok) {
                    alert(result.message);
                    // Optionally, you can clear the form or give other feedback
                    registerForm.reset();
                    // You might want to switch to the login view here if it's in a modal
                    // For now, just an alert.
                } else {
                    alert(result.message || result.mensagem);
                }

            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao tentar cadastrar.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const data = { email, password };

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token);
                    alert(result.message);
                    window.location.href = '/home'; // Redireciona para a página principal da aplicação
                } else {
                    alert(result.message);
                }

            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao tentar fazer login.');
            }
        });
    }
});