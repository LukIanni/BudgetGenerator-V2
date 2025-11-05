document.addEventListener('DOMContentLoaded', () => {
    const editorResposta = document.getElementById('editorResposta');
    const respostaOriginal = localStorage.getItem('respostaParaEditar');
    const saveConfirmModal = document.getElementById('saveConfirmModal');
    const confirmSaveBtn = document.getElementById('confirmSaveBtn');
    
    if (respostaOriginal) {
        editorResposta.innerHTML = respostaOriginal;
    } else {
        window.location.href = '/orcamento.html';
    }

    confirmSaveBtn.addEventListener('click', () => {
        window.location.href = '/home';
    });
});

function salvarEdicao() {
    const respostaEditada = document.getElementById('editorResposta').innerHTML;
    const idOrcamento = localStorage.getItem('idOrcamentoAtual');
    const tipoOrcamento = localStorage.getItem('tipoOrcamentoAtual');
    const token = localStorage.getItem('token');

    if (!idOrcamento || !tipoOrcamento) {
        alert('Informações do orçamento não encontradas');
        return;
    }

    fetch(`/api/orcamento/atualizar-resposta/${idOrcamento}?tipo=${tipoOrcamento}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resposta: respostaEditada })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar as alterações');
        }
        return response.json();
    })
    .then(data => {
        // Limpa os dados do localStorage
        localStorage.removeItem('respostaParaEditar');
        localStorage.removeItem('idOrcamentoAtual');
        localStorage.removeItem('tipoOrcamentoAtual');
        
        // Mostra o modal de confirmação
        const saveConfirmModal = document.getElementById('saveConfirmModal');
        saveConfirmModal.style.display = 'flex';
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar as alterações. Por favor, tente novamente.');
    });
}
