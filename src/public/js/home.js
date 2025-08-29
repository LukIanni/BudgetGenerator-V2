document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        // If no token, redirect to login page
        window.location.href = '/';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            // You can also update the image source if you have a URL for it
            // document.getElementById('userImage').src = user.imageUrl || '../images/default-avatar.png';

            // Handle budget list (currently static)
            const budgetList = document.getElementById('budgetList');
            // Clear placeholder
            budgetList.innerHTML = ''; 
            // Example of how to render budgets when you have them
            const budgets = user.budgets || [];
            if (budgets.length === 0) {
                budgetList.innerHTML = '<li class="list-group-item corTextos">Nenhum orçamento encontrado.</li>';
            } else {
                budgets.forEach(budget => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between corTextos align-items-center py-2';
                    li.innerHTML = `
                        ${budget.name} 
                        <a href="/orcamento/${budget.id}" class="btn text-light corBotoes">Ver Orçamento</a>
                    `;
                    budgetList.appendChild(li);
                });
            }

        } else {
            // If token is invalid or expired
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });
});
