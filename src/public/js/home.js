document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // --- Elementos do DOM ---
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userImageEl = document.getElementById('userImage');
    const budgetListEl = document.getElementById('budgetList');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Formulário de atualização de dados
    const toggleUpdateFormBtn = document.getElementById('toggleUpdateFormBtn');
    const updateFormContainer = document.getElementById('updateFormContainer');
    const updateForm = document.getElementById('updateForm');
    const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
    const feedbackMessageEl = document.getElementById('feedbackMessage');

    // Modal de exclusão
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const keepAccountBtn = document.getElementById('keepAccountBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Modal de upload de foto
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const photoUploadModal = document.getElementById('photoUploadModal');
    const photoUploadForm = document.getElementById('photoUploadForm');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const removePhotoBtn = document.getElementById('removePhotoBtn'); // Botão de remover foto

    // --- Funções ---
    const showFeedback = (message, isError = false) => {
        feedbackMessageEl.textContent = message;
        feedbackMessageEl.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        feedbackMessageEl.style.display = 'block';
        setTimeout(() => {
            feedbackMessageEl.style.display = 'none';
        }, 3000);
    };

    // --- Carregamento de Dados ---
    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
            const user = await response.json();
            userNameEl.textContent = user.name;
            userEmailEl.textContent = user.email;
            if (user.photo) userImageEl.src = user.photo;

            const budgets = user.budgets || [];
            budgetListEl.innerHTML = '';
            if (budgets.length === 0) {
                budgetListEl.innerHTML = '<li class="list-group-item corTextos">Nenhum orçamento encontrado.</li>';
            } else {
                budgets.forEach(budget => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between corTextos align-items-center py-2';
                    li.innerHTML = `${budget.name} <a href="/orcamento/${budget.id}" class="btn text-light corBotoes">Ver</a>`;
                    budgetListEl.appendChild(li);
                });
            }
        } else {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });

    toggleUpdateFormBtn.addEventListener('click', () => {
        updateFormContainer.style.display = updateFormContainer.style.display === 'block' ? 'none' : 'block';
    });

    cancelUpdateBtn.addEventListener('click', () => {
        updateFormContainer.style.display = 'none';
        updateForm.reset();
    });

    updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('updateEmail').value.trim();
        const password = document.getElementById('updatePassword').value.trim();
        const body = {};
        if (email) body.email = email;
        if (password) body.password = password;

        if (Object.keys(body).length === 0) {
            showFeedback('Preencha ao menos um campo.', true);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (response.ok) {
                showFeedback('Dados atualizados com sucesso!');
                if (result.email) userEmailEl.textContent = result.email;
                updateForm.reset();
                setTimeout(() => { updateFormContainer.style.display = 'none'; }, 2000);
            } else {
                showFeedback(result.message || 'Erro ao atualizar.', true);
            }
        } catch (error) {
            showFeedback('Erro de conexão.', true);
        }
    });

    // Lógica do Modal de Exclusão
    deleteAccountBtn.addEventListener('click', () => { deleteConfirmModal.style.display = 'flex'; });
    keepAccountBtn.addEventListener('click', () => { deleteConfirmModal.style.display = 'none'; });
    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users/profile', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                alert('Conta excluída com sucesso.');
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                const result = await response.json();
                alert(result.message || 'Erro ao excluir conta.');
                deleteConfirmModal.style.display = 'none';
            }
        } catch (error) {
            alert('Erro de conexão.');
            deleteConfirmModal.style.display = 'none';
        }
    });

    // Lógica do Modal de Upload de Foto
    changePhotoBtn.addEventListener('click', () => { photoUploadModal.style.display = 'flex'; });
    cancelUploadBtn.addEventListener('click', () => { photoUploadModal.style.display = 'none'; });

    removePhotoBtn.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja remover sua foto de perfil? A foto padrão será restaurada.')) {
            try {
                const response = await fetch('http://localhost:3000/api/users/profile/photo', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    userImageEl.src = result.photo; // Atualiza para a foto padrão
                    photoUploadModal.style.display = 'none';
                } else {
                    alert(result.message || 'Erro ao remover a foto.');
                }
            } catch (error) {
                alert('Erro de conexão ao remover a foto.');
            }
        }
    });

    photoUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const photoFile = document.getElementById('photoFile').files[0];
        if (!photoFile) {
            alert('Por favor, selecione um arquivo de imagem.');
            return;
        }

        const formData = new FormData();
        formData.append('profilePhoto', photoFile);

        try {
            const response = await fetch('http://localhost:3000/api/users/profile/photo', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                alert('Foto de perfil atualizada com sucesso!');
                userImageEl.src = result.photo; // Atualiza a imagem na página
                photoUploadModal.style.display = 'none';
            } else {
                alert(result.message || 'Erro ao fazer upload da foto.');
            }
        } catch (error) {
            alert('Erro de conexão ao fazer upload.');
        }
    });
});
