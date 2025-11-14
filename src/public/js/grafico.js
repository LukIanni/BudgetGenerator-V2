    // ARQUIVO: grafico.js

// ARQUIVO: grafico.js (Agora, lógica de Dashboard)

const API_BASE = '/api/orcamento';

// ====================================================================
// FUNÇÃO PRINCIPAL: 1. Carrega dados e 2. Desenha Cards
// ====================================================================
async function loadAndDrawMetricsCards() {
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('metricsCardsContainer').innerHTML = '<p class="text-danger">Autenticação necessária.</p>';
        return;
    }
    
    // Fazendo múltiplas requisições em paralelo
    const [resumoContagemResponse, custoMedioResponse, totaisAcumuladosResponse ] = await Promise.all([
        fetch(`${API_BASE}/resumo-contagem`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/custo-medio`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/totais-acumulados`, { headers: { 'Authorization': `Bearer ${token}` } }), // NOVO FETCH
    ]);

    if (!resumoContagemResponse.ok || !custoMedioResponse.ok) {
        document.getElementById('metricsCardsContainer').innerHTML = '<p class="text-danger">Erro ao carregar dados do dashboard.</p>';
        return;
    }

    const resumoContagem = await resumoContagemResponse.json();
    const custoMedio = await custoMedioResponse.json();
    const totaisAcumulados = await totaisAcumuladosResponse.json(); // NOVO DADO
    
    // Função auxiliar para formatar como R$
    const formatarRS = (valor) => parseFloat(valor).toFixed(2).replace('.', ',');


    // 1. Prepara os Dados dos Cards
    const cardsData = [
        { 
            id: 'total-orcamentos', 
            icon: 'bi-list-ul', 
            label: 'Orçamentos Totais', 
            value: resumoContagem.Total,
            unit: 'unidades',
            color: 'primary'
        },
        { 
            id: 'custo-medio-produto', 
            icon: 'bi-currency-dollar', 
            label: 'Custo Médio Produto', 
            value: parseFloat(custoMedio.Produto).toFixed(2).replace('.', ','), 
            unit: 'R$',
            color: 'success'
        },
        { 
            id: 'contagem-servico', 
            icon: 'bi-tools', 
            label: 'Orçamentos Serviço', 
            value: resumoContagem.Servico, 
            unit: 'unidades',
            color: 'warning'
        },
        { 
            id: 'custo-total-acumulado', 
            icon: 'bi-box-seam', 
            label: 'Custo Total Acumulado', 
            value: formatarRS(totaisAcumulados.TotalCusto), 
            unit: 'R$',
            color: 'danger', // Vermelho para custo
            data: totaisAcumulados // Passa os dados para o gráfico de detalhe
        },
        { 
            id: 'lucro-total-acumulado', 
            icon: 'bi-piggy-bank', 
            label: 'Lucro Total Bruto', 
            value: formatarRS(totaisAcumulados.TotalLucro), 
            unit: 'R$',
            color: 'info', // Ciano para lucro
            data: totaisAcumulados
        },
    ];

    
    
    // 2. Desenha os Cards no Container
    const container = document.getElementById('metricsCardsContainer');
    container.innerHTML = cardsData.map(data => `
        <div class="col-md-4">
            <div class="card bg-${data.color} text-white shadow metric-card" data-metric-id="${data.id}">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <i class="bi ${data.icon} fs-3 me-3"></i>
                        <div>
                            <p class="card-text mb-0">${data.label}</p>
                            <h4 class="card-title">${data.unit} ${data.value}</h4>
                        </div>
                    </div>
                    <small class="text-white-50">Clique para detalhar</small>
                </div>
            </div>
        </div>
    `).join('');

    // 3. Adiciona Listeners aos Cards
    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('click', function() {
            const metricId = this.getAttribute('data-metric-id');
            // Chama a função que desenha o gráfico individual
            drawIndividualChart(metricId, resumoContagem, custoMedio); 
        });
    });
}

// ====================================================================
// FUNÇÃO DE DETALHE: Desenha o Gráfico Individual
// ====================================================================

function drawIndividualChart(metricId, contagemData, custoData) {
    // 1. Esconde os cards e mostra o wrapper do gráfico
    document.getElementById('metricsCardsContainer').style.display = 'none';
    document.getElementById('individualChartWrapper').style.display = 'block';

    let labels, data, title;
    
    // Define os dados baseados no card clicado (metricId)
    switch (metricId) {
        case 'total-orcamentos':
            labels = ['Produto', 'Serviço'];
            data = [contagemData.Produto, contagemData.Servico];
            title = 'Distribuição de Orçamentos (Produto vs. Serviço)';
            break;
        case 'custo-medio-produto':
            // Isso requereria uma nova rota no backend para detalhar custos de produtos,
            // mas faremos um gráfico simples por enquanto.
            labels = ['Produto'];
            data = [parseFloat(custoData.Produto)];
            title = 'Custo Médio do Produto';
            break;
        case 'contagem-servico':
            labels = ['Serviço'];
            data = [contagemData.Servico];
            title = 'Total de Orçamentos de Serviço';
            break;
        default:
            return;
    }
    
    // 2. Atualiza o título
    document.getElementById('chartTitle').textContent = title;

    const chartElement = document.getElementById('budgetChart');
    
    // Destroi a instância anterior do gráfico (se existir)
    if (Chart.getChart(chartElement)) {
        Chart.getChart(chartElement).destroy();
    }

    // 3. Desenha o novo gráfico (Exemplo: Tipo Barra ou Donut)
    new Chart(chartElement, {
        type: (metricId === 'total-orcamentos' ? 'doughnut' : 'bar'), // Usa Donut para distribuição, Barra para outros
        data: {
            labels: labels,
            datasets: [{
                label: 'Valor',
                data: data,
                backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(75, 192, 192, 0.7)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            // ... (Opções de gráfico aqui)
        }
    });
}

// ARQUIVO: home.js

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleChartBtn');
    const dashboardContainer = document.getElementById('dashboardContainer');

    if (toggleBtn && dashboardContainer) {
        toggleBtn.addEventListener('click', () => {
            if (dashboardContainer.style.display === 'none') {
                dashboardContainer.style.display = 'block'; // Mostra o container
                
                // *** NOVA CHAMADA: Carrega os cards de métricas ***
                loadAndDrawMetricsCards();
                
                toggleBtn.innerHTML = '<i class="bi bi-bar-chart-fill me-1"></i> Ocultar Gráficos';
            } else {
                dashboardContainer.style.display = 'none'; // Esconde o container
                toggleBtn.innerHTML = '<i class="bi bi-bar-chart-fill me-1"></i> Visualizar Gráficos';
            }
        });

        const backBtn = document.getElementById('backToMetricsBtn');
        backBtn.addEventListener('click', () => {
            document.getElementById('metricsCardsContainer').style.display = 'flex'; // Mostra os cards
            document.getElementById('individualChartWrapper').style.display = 'none'; // Esconde o gráfico
        });
    }
});

// =======================================================
    // NOVO BLOCO (Ou Verificação): Lógica para o botão de VOLTAR
    // =======================================================
    const backBtn = document.getElementById('backToMetricsBtn');
    
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // 1. Mostra os Cards
            const cardsContainer = document.getElementById('metricsCardsContainer');
            if (cardsContainer) {
                cardsContainer.style.display = 'flex'; // Usamos 'flex' no CSS dos cards
            }
            
            // 2. Esconde o Gráfico
            const chartWrapper = document.getElementById('individualChartWrapper');
            if (chartWrapper) {
                chartWrapper.style.display = 'none';
            }
        });
    }