document.addEventListener('DOMContentLoaded', () => {
    const formOrcamento = document.getElementById('formOrcamento');
    
    formOrcamento.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('Você precisa estar logado para gerar um orçamento');
            window.location.href = '/';
            return;
        }

        const formData = new FormData(formOrcamento);
        const dados = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/orcamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            });

            if (!response.ok) {
                throw new Error('Erro ao gerar orçamento');
            }

            const result = await response.json();
            
            // Armazena os dados para edição
            localStorage.setItem('respostaParaEditar', result.resposta);
            localStorage.setItem('idOrcamentoAtual', result.id);
            localStorage.setItem('tipoOrcamentoAtual', result.tipo);

            // Mostra a resposta em um modal
            const respostaModal = new bootstrap.Modal(document.getElementById('respostaModal'));
            const respostaModalBody = document.getElementById('respostaModalBody');
            const editarRespostaBtn = document.getElementById('editarRespostaBtn');
            
            respostaModalBody.innerHTML = result.resposta;
            
            // Configura o botão de edição
            editarRespostaBtn.onclick = () => {
                window.location.href = '/views/editarResposta.html';
            };
            
            respostaModal.show();
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao gerar orçamento. Por favor, tente novamente.');
        }
    });
});
