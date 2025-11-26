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

    // Modal de exclusão de conta
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const keepAccountBtn = document.getElementById('keepAccountBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Modal de exclusão de orçamento
    const deleteBudgetConfirmModal = document.getElementById('deleteBudgetConfirmModal');
    const confirmDeleteBudgetBtn = document.getElementById('confirmDeleteBudgetBtn');
    const cancelDeleteBudgetBtn = document.getElementById('cancelDeleteBudgetBtn');
    let budgetToDelete = null;

    // Modal de upload de foto
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const photoUploadModal = document.getElementById('photoUploadModal');
    const photoUploadForm = document.getElementById('photoUploadForm');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    const removePhotoBtn = document.getElementById('removePhotoBtn');

    // Elementos de Orçamentos
    const budgetListEl = document.getElementById('budgetList');
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationControls = document.getElementById('paginationControls');
    let meusOrcamentos = []; // Para armazenar os orçamentos buscados
    let currentPage = 1;
    const itemsPerPage = 5;

    // Ad Container
    const adContainer = document.getElementById('adContainer');



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
            meusOrcamentos.sort((a, b) => new Date(b.data) - new Date(a.data));
            renderizarOrcamentos(1);

        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
            budgetListEl.innerHTML = `<li class="list-group-item">Erro ao carregar orçamentos.</li>`;
        }
    };

    const renderizarOrcamentos = (page = 1) => {
        currentPage = page;
        budgetListEl.innerHTML = ''; // Limpa a lista

        if (meusOrcamentos.length === 0) {
            budgetListEl.innerHTML = `<li class="list-group-item d-flex justify-content-between corTextos align-items-center py-2">Nenhum orçamento encontrado.</li>`;
            paginationContainer.style.display = 'none';
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = meusOrcamentos.slice(startIndex, endIndex);

        paginatedItems.forEach(orcamento => {
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

        renderizarControlesPaginacao();
    };

    const renderizarControlesPaginacao = () => {
        paginationControls.innerHTML = '';
        const pageCount = Math.ceil(meusOrcamentos.length / itemsPerPage);

        if (pageCount <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'block';

        // Botão "Anterior"
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>`;
        paginationControls.appendChild(prevLi);

        // Botões de página
        for (let i = 1; i <= pageCount; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            paginationControls.appendChild(pageLi);
        }

        // Botão "Próximo"
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === pageCount ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Próximo</a>`;
        paginationControls.appendChild(nextLi);
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

    // toggleUpdateFormBtn não existe mais pois o formulário está no modal Bootstrap
    // removido: toggleUpdateFormBtn.addEventListener('click', ...)
    // removido: cancelUpdateBtn.addEventListener('click', ...)

    if (updateForm) {
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
                    setTimeout(() => {
                        updateFormContainer.style.display = 'none';
                        adContainer.style.display = 'none';
                    }, 2000);
                } else {
                    showFeedback(result.message || 'Erro ao atualizar.', true);
                }
            } catch (error) {
                showFeedback('Erro de conexão.', true);
            }
        });
    }

    // Lógica do Modal de Exclusão de Conta
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

    // Lógica do Modal de Exclusão de Orçamento
    cancelDeleteBudgetBtn.addEventListener('click', () => {
        deleteBudgetConfirmModal.style.display = 'none';
        budgetToDelete = null;
    });

    confirmDeleteBudgetBtn.addEventListener('click', async () => {
        if (!budgetToDelete) return;

        const { id, tipo } = budgetToDelete;

        try {
            const response = await fetch(`/api/orcamento/${id}?tipo=${tipo}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir');
            }

            alert('Orçamento excluído com sucesso!');
            carregarOrcamentos();
            deleteBudgetConfirmModal.style.display = 'none';
            budgetToDelete = null;

        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir o orçamento.');
            deleteBudgetConfirmModal.style.display = 'none';
        }
    });

    // Lógica do Modal de Upload de Foto
    console.log('🖼️ [FOTO] Inicializando listeners de upload de foto...');
    console.log('🖼️ [FOTO] changePhotoBtn:', !!changePhotoBtn);
    console.log('🖼️ [FOTO] photoUploadModal:', !!photoUploadModal);
    console.log('🖼️ [FOTO] photoUploadForm:', !!photoUploadForm);
    console.log('🖼️ [FOTO] cancelUploadBtn:', !!document.getElementById('cancelUploadBtn'));
    console.log('🖼️ [FOTO] removePhotoBtn:', !!removePhotoBtn);

    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            console.log('📸 Botão "Alterar Foto" clicado!');
            if (photoUploadModal) {
                photoUploadModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                console.log('✅ Modal de foto aberto');
            }
        });
    }

    const cancelUploadBtnEl = document.getElementById('cancelUploadBtn');
    if (cancelUploadBtnEl) {
        cancelUploadBtnEl.addEventListener('click', () => {
            console.log('❌ Cancelar upload clicado');
            if (photoUploadModal) {
                photoUploadModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                photoUploadForm.reset();
                document.getElementById('filePreview').style.display = 'none';
            }
        });
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', async () => {
            if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {
                const originalText = removePhotoBtn.innerHTML;
                removePhotoBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Removendo...';
                removePhotoBtn.disabled = true;

                try {
                    const response = await fetch('/api/users/profile/photo', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert(result.message || 'Foto removida com sucesso!');
                        userImageEl.src = result.photo || '../images/testeusuario.jpeg';
                        photoUploadModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                        photoUploadForm.reset();
                    } else {
                        alert(result.message || 'Erro ao remover a foto.');
                    }
                } catch (error) {
                    console.error('❌ Erro ao remover foto:', error);
                    alert('Erro de conexão ao remover a foto.');
                } finally {
                    removePhotoBtn.innerHTML = originalText;
                    removePhotoBtn.disabled = false;
                }
            }
        });
    }

    if (photoUploadForm) {
        photoUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const photoFile = document.getElementById('photoFile').files[0];
            
            if (!photoFile) {
                alert('Por favor, selecione um arquivo de imagem.');
                return;
            }

            // Validar tamanho (máx 5MB)
            if (photoFile.size > 5 * 1024 * 1024) {
                alert('O arquivo é muito grande. Máximo de 5MB.');
                return;
            }

            // Validar tipo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(photoFile.type)) {
                alert('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
                return;
            }

            const submitBtn = photoUploadForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append('profilePhoto', photoFile);

            try {
                console.log('📤 Iniciando upload de foto...');
                const response = await fetch('/api/users/profile/photo', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                console.log('📥 Response status:', response.status);
                const result = await response.json();
                console.log('📥 Response:', result);

                if (response.ok) {
                    alert('Foto de perfil atualizada com sucesso!');
                    userImageEl.src = result.photo;
                    photoUploadModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    photoUploadForm.reset();
                    document.getElementById('filePreview').style.display = 'none';
                } else {
                    alert(result.message || 'Erro ao fazer upload da foto.');
                }
            } catch (error) {
                console.error('❌ Erro ao fazer upload:', error);
                alert('Erro de conexão ao fazer upload.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Adicionar preview de imagem quando arquivo é selecionado
    const photoFileInput = document.getElementById('photoFile');
    if (photoFileInput) {
        photoFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const previewDiv = document.getElementById('filePreview');
                    const previewImg = document.getElementById('previewImage');
                    const fileNameEl = document.getElementById('fileName');
                    
                    previewImg.src = event.target.result;
                    fileNameEl.textContent = file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)';
                    previewDiv.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }


    // Lógica do Modal de Upload de Foto - DESATIVADO TEMPORARIAMENTE
    // Será reativado quando corrigido

    // Event Listener para Orçamentos
    budgetListEl.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;
        const tipo = target.dataset.tipo;

        // Botão de Excluir
        if (target.classList.contains('delete-btn')) {
            budgetToDelete = { id, tipo };
            deleteBudgetConfirmModal.style.display = 'flex';
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

    paginationControls.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target;
        if (target.tagName === 'A' && !target.parentElement.classList.contains('disabled')) {
            const page = parseInt(target.dataset.page, 10);
            if (page) {
                renderizarOrcamentos(page);
            }
        }
    });

    // --- Configuração das Abas (Orçamentos vs Estatísticas) ---
    const tabOrcamentosBtn = document.getElementById('tabOrcamentosBtn');
    const tabEstatisticasBtn = document.getElementById('tabEstatisticasBtn');
    const listContainer = document.getElementById('listContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const backBtn = document.getElementById('backToMetricsBtn');

    console.log('Elementos das abas encontrados:', {
        tabOrcamentosBtn: !!tabOrcamentosBtn,
        tabEstatisticasBtn: !!tabEstatisticasBtn,
        listContainer: !!listContainer,
        dashboardContainer: !!dashboardContainer,
        backBtn: !!backBtn
    });

    if (tabOrcamentosBtn && tabEstatisticasBtn && listContainer && dashboardContainer) {
        // Evento para aba "Orçamentos Gerados"
        tabOrcamentosBtn.addEventListener('click', () => {
            console.log('Aba Orçamentos Gerados clicada');

            // Atualizar estado das abas
            tabOrcamentosBtn.classList.add('tab-active');
            tabEstatisticasBtn.classList.remove('tab-active');

            // Mostrar lista e ocultar dashboard
            listContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
        });

        // Evento para aba "Estatísticas"
        tabEstatisticasBtn.addEventListener('click', () => {
            console.log('Aba Estatísticas clicada');

            // Atualizar estado das abas
            tabEstatisticasBtn.classList.add('tab-active');
            tabOrcamentosBtn.classList.remove('tab-active');

            // Mostrar dashboard e ocultar lista
            dashboardContainer.style.display = 'block';
            loadAndDrawMetricsCards();
            listContainer.style.display = 'none';
        });
    } else {
        console.error('Elementos das abas não encontrados:', {
            tabOrcamentosBtn: tabOrcamentosBtn,
            tabEstatisticasBtn: tabEstatisticasBtn,
            listContainer: listContainer,
            dashboardContainer: dashboardContainer
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            console.log('Voltando para métricas');
            document.getElementById('metricsCardsContainer').style.display = 'flex';
            document.getElementById('individualChartWrapper').style.display = 'none';
        });
    } else {
        console.error('Botão voltar não encontrado');
    }
});