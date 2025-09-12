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

    // Elementos de Orçamentos
    const budgetListEl = document.getElementById('budgetList');
    let meusOrcamentos = []; // Para armazenar os orçamentos buscados

    // --- Funções Auxiliares ---
    const showFeedback = (message, isError = false) => {
        feedbackMessageEl.textContent = message;
        feedbackMessageEl.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        feedbackMessageEl.style.display = 'block';
        setTimeout(() => {
            feedbackMessageEl.style.display = 'none';
        }, 3000);
    };

    // --- Funções de Orçamentos ---
    const carregarOrcamentos = async () => {
        try {
            const response = await fetch('/api/orcamento/meus-orcamentos', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar orçamentos');
            }

            meusOrcamentos = await response.json();
            renderizarOrcamentos();

        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
            budgetListEl.innerHTML = `<li class="list-group-item">Erro ao carregar orçamentos.</li>`;
        }
    };

    const renderizarOrcamentos = () => {
        budgetListEl.innerHTML = ''; // Limpa a lista

        if (meusOrcamentos.length === 0) {
            budgetListEl.innerHTML = `<li class="list-group-item d-flex justify-content-between corTextos align-items-center py-2">Nenhum orçamento encontrado.</li>`;
            return;
        }

        meusOrcamentos.forEach(orcamento => {
            const dataFormatada = new Date(orcamento.data).toLocaleDateString('pt-BR');
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between corTextos align-items-center py-2';
            item.innerHTML = `
                <div>
                    <strong>${orcamento.nome}</strong>
                    <small class="d-block text-muted">Criado em: ${dataFormatada}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-primary view-btn me-2" data-id="${orcamento.id}" data-tipo="${orcamento.tipo}">Visualizar/Editar</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${orcamento.id}" data-tipo="${orcamento.tipo}">Excluir</button>
                </div>
            `;
            budgetListEl.appendChild(item);
        });
    };

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
        } else {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        localStorage.removeItem('token');
        window.location.href = '/';
    }

    // Carrega orçamentos
    carregarOrcamentos();

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

    // Event Listener para Orçamentos
    budgetListEl.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;
        const tipo = target.dataset.tipo;

        // Botão de Excluir
        if (target.classList.contains('delete-btn')) {
            const budgetName = target.closest('li').querySelector('strong').textContent;
            if (confirm(`Tem certeza que deseja excluir o orçamento "${budgetName}"?`)) {
                try {
                    const response = await fetch(`/api/orcamento/${id}?tipo=${tipo}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    if (!response.ok) {
                        throw new Error('Falha ao excluir');
                    }
                    
                    // Remove o item da lista na UI
                    target.closest('li').remove();
                    alert('Orçamento excluído com sucesso!');

                } catch (error) {
                    console.error('Erro ao excluir:', error);
                    alert('Erro ao excluir o orçamento.');
                }
            }
        }

        // Botão de Visualizar/Editar
        if (target.classList.contains('view-btn')) {
            const orcamentoParaEditar = meusOrcamentos.find(o => o.id == id && o.tipo == tipo);
            if (orcamentoParaEditar) {
                localStorage.setItem('respostaParaEditar', orcamentoParaEditar.resposta);
                localStorage.setItem('idOrcamentoAtual', orcamentoParaEditar.id);
                localStorage.setItem('tipoOrcamentoAtual', orcamentoParaEditar.tipo);
                window.location.href = '/views/editarResposta.html';
            }
        }
    });
});