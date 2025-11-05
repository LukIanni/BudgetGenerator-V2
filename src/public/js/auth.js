document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toastContainer = document.querySelector('.toast-container');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginEmailInput = document.getElementById('loginEmail');

    // Check for remembered email on page load
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        loginEmailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }

    const showToast = (message, type = 'danger') => {
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    };

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
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();
                
                if (response.ok && result.token) {
                    localStorage.setItem('token', result.token);
                    window.location.href = '/home';
                } else {
                    showToast(result.message || result.mensagem);
                }

            } catch (error) {
                console.error('Erro:', error);
                showToast('Erro de conexão. Tente novamente.');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            // Handle "Remember me" functionality
            if (rememberMeCheckbox.checked) {
                // Storing password in local storage is insecure. Only storing email.
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const data = { email, password };

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token);
                    window.location.href = '/home';
                } else {
                    showToast(result.message);
                }

            } catch (error) {
                console.error('Erro:', error);
                showToast('Erro de conexão. Tente novamente.');
            }
        });
    }
});