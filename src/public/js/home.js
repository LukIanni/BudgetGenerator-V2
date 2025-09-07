// home.js - VERSÃO CORRIGIDA E COMPLETA

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // 1. Redireciona se o usuário não estiver logado
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
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    // --- Funções Auxiliares ---
    const showFeedback = (message, isError = false) => {
        feedbackMessageEl.textContent = message;
        feedbackMessageEl.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        feedbackMessageEl.style.display = 'block';
        setTimeout(() => {
            feedbackMessageEl.style.display = 'none';
        }, 3000);
    };

    // Função para buscar e exibir os orçamentos
    async function fetchAndRenderBudgets() {
        try {
            const response = await fetch('/api/orcamento/meus-orcamentos', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Não autorizado. Por favor, faça login novamente.');
                }
                throw new Error('Erro ao buscar orçamentos.');
            }

            const orcamentos = await response.json();
            budgetListEl.innerHTML = '';

            if (orcamentos.length === 0) {
                budgetListEl.innerHTML = `<li class="list-group-item d-flex justify-content-between corTextos align-items-center py-2">Nenhum orçamento encontrado.</li>`;
                return;
            }

            orcamentos.forEach(orcamento => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between corTextos align-items-center py-2';
                const dataFormatada = new Date(orcamento.data).toLocaleDateString('pt-BR');
                li.innerHTML = `
                    <div class="d-flex flex-column">
                        <span class="fw-bold">${orcamento.nome}</span>
                        <small class="text-muted">${dataFormatada}</small>
                    </div>
                    <div>
                        <a href="/api/orcamento/download/${orcamento.id}?tipo=${orcamento.tipo}" 
                           class="btn btn-primary btn-sm"
                           target="_blank">
                           <i class="bi bi-download"></i> Baixar PDF
                        </a>
                    </div>
                `;
                budgetListEl.appendChild(li);
            });
        } catch (error) {
            console.error('Erro:', error);
            budgetListEl.innerHTML = `<li class="list-group-item d-flex justify-content-between text-danger align-items-center py-2">Erro ao carregar orçamentos.</li>`;
        }
    }

    // --- Execução da Lógica ao Carregar a Página ---
    // Carrega dados do perfil
    try {
        const userResponse = await fetch('/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (userResponse.ok) {
            const user = await userResponse.json();
            userNameEl.textContent = user.name;
            userEmailEl.textContent = user.email;
            if (user.photo) userImageEl.src = user.photo;
            
            // Chama a função para buscar e renderizar os orçamentos
            await fetchAndRenderBudgets(); 
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
            const response = await fetch('/api/users/profile', {
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
            const response = await fetch('/api/users/profile', {
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
                const response = await fetch('/api/users/profile/photo', {
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
            const response = await fetch('/api/users/profile/photo', {
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