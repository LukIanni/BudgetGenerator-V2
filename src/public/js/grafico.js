// ARQUIVO: grafico.js

const API_BASE = '/api/orcamento';

// ====================================================================
// FUNÇÃO PRINCIPAL: Carrega dados e Desenha Cards
// ====================================================================
async function loadAndDrawMetricsCards() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa fazer login novamente.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const [
            resumoContagemResponse,
            produtoResponse,
            totaisAcumuladosResponse,
            valorTotalServicosResponse
        ] = await Promise.all([
            fetch(`${API_BASE}/resumo-contagem`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/produtos-mais-orcados`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/totais-acumulados`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/valor-total-servicos`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (
            resumoContagemResponse.status === 401 ||
            produtoResponse.status === 401 ||
            totaisAcumuladosResponse.status === 401 ||
            valorTotalServicosResponse.status === 401
        ) {
            alert('Sua sessão expirou. Faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        if (
            !resumoContagemResponse.ok ||
            !produtoResponse.ok ||
            !totaisAcumuladosResponse.ok ||
            !valorTotalServicosResponse.ok
        ) {
            throw new Error('Erro ao carregar dados');
        }

        const resumoContagem = await resumoContagemResponse.json();
        const produtosMaisOrcados = await produtoResponse.json();
        const totaisAcumulados = await totaisAcumuladosResponse.json();
        const valorTotalServicos = await valorTotalServicosResponse.json();

        const formatarRS = (valor) =>
            parseFloat(valor).toFixed(2).replace('.', ',');

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
                id: 'produtos-mais-orcados',
                icon: 'bi-cart-check',
                label: 'Produtos Mais Orçados',
                value: produtosMaisOrcados.length > 0
                    ? produtosMaisOrcados[0].contagem.toLocaleString('pt-BR')
                    : '0',
                subtitle: produtosMaisOrcados.length > 0
                    ? produtosMaisOrcados[0].produto
                    : '-',
                unit: 'orçamentos',
                color: 'primary'
            },
            {
    id: 'valor-total-servicos',
    icon: 'bi-tools',
    label: 'Valor Total em Serviços',
    value: formatarRS(valorTotalServicos.valorTotal),
    subtitle: `${valorTotalServicos.quantidadeServicos} serviços (${valorTotalServicos.variacaoPercentual.toFixed(1)}% vs anterior)`,
    unit: 'R$',
    color: 'warning'
},
            {
                id: 'custo-total-acumulado',
                icon: 'bi-box-seam',
                label: 'Custo Total Acumulado',
                value: formatarRS(totaisAcumulados.TotalCusto),
                unit: 'R$',
                color: 'danger',
                data: totaisAcumulados
            },
            {
                id: 'lucro-total-acumulado',
                icon: 'bi-piggy-bank',
                label: 'Lucro Total Bruto',
                value: formatarRS(totaisAcumulados.TotalLucro),
                unit: 'R$',
                color: 'info',
                data: totaisAcumulados
            },
        ];

        // No seu grafico.js, atualize a parte que gera os cards:
// No seu grafico.js, atualize a parte que gera os cards:

const container = document.getElementById('metricsCardsContainer');
container.innerHTML = cardsData.map(data => `
    <div class="col-md-4">
        <div class="card bg-${data.color} text-white shadow metric-card" data-metric-id="${data.id}">
            <div class="card-body d-flex flex-column">
                <div class="d-flex align-items-center mb-2">
                    <i class="bi ${data.icon} fs-3 me-3 flex-shrink-0"></i>
                    <div class="flex-grow-1">
                        <p class="card-text mb-1" style="font-size: 0.85rem; line-height: 1.2;">${data.label}</p>
                        <h4 class="card-title mb-0" style="font-size: 1.4rem;">${data.value} ${data.unit}</h4>
                    </div>
                </div>
                ${data.subtitle ? `<small class="mt-auto mb-1" style="font-size: 0.75rem; line-height: 1.1;">${data.subtitle}</small>` : ''}
                <small class="text-white-50 mt-auto" style="font-size: 0.7rem;">Clique para detalhar</small>
            </div>
        </div>
    </div>
`).join('');

        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('click', function () {
                const metricId = this.getAttribute('data-metric-id');
                drawIndividualChart(metricId, resumoContagem, produtosMaisOrcados, totaisAcumulados, valorTotalServicos);
            });
        });

    } catch (err) {
        console.error(err);
        alert('Falha ao carregar métricas.');
    }
}

// ====================================================================
// FUNÇÃO DE DETALHE: Desenha o Gráfico Individual
// ====================================================================
function drawIndividualChart(metricId, contagemData, produtosMaisOrcados, totaisAcumulados, valorTotalServicos) {
    document.getElementById('metricsCardsContainer').style.display = 'none';
    document.getElementById('individualChartWrapper').style.display = 'block';

    let labels, data, title, chartType;

    switch (metricId) {
        case 'total-orcamentos':
            labels = ['Produto', 'Serviço'];
            data = [contagemData.Produto, contagemData.Servico];
            title = 'Distribuição de Orçamentos (Produto vs. Serviço)';
            chartType = 'doughnut';
            break;

        case 'produtos-mais-orcados':
            const dadosOrdenados = produtosMaisOrcados
                .sort((a, b) => b.contagem - a.contagem)
                .slice(0, 15);

            labels = dadosOrdenados.map(item => item.produto);
            data = dadosOrdenados.map(item => item.contagem);
            title = 'Produtos Mais Orçados';
            chartType = 'bar';
            break;

        // No switch case 'valor-total-servicos' do drawIndividualChart:
// No switch case 'valor-total-servicos' do drawIndividualChart:
case 'valor-total-servicos':
    labels = [
        `Período Atual (${valorTotalServicos.periodoAtual})`,
        `Período Anterior (${valorTotalServicos.periodoAnterior})`
    ];
    data = [valorTotalServicos.valorTotal, valorTotalServicos.valorAnterior];
    title = `Comparação: Valor Total dos Serviços (Variação: ${valorTotalServicos.variacaoPercentual.toFixed(1)}%)`;
    chartType = 'bar';
    
    // Configuração especial para o tooltip detalhado
    const tooltipCallbacks = {
        label: function(context) {
            const periodo = context.label.includes('Atual') ? 'atual' : 'anterior';
            const servicos = periodo === 'atual' 
                ? valorTotalServicos.servicosDetalhadosAtual 
                : valorTotalServicos.servicosDetalhadosAnterior;
            
            let tooltipText = [`Total: R$ ${parseFloat(context.raw).toFixed(2).replace('.', ',')}`];
            
            // Adicionar detalhes dos serviços se existirem
            if (servicos && servicos.length > 0) {
                tooltipText.push('--- Serviços ---');
                servicos.forEach(servico => {
                    tooltipText.push(`${servico.nome}: R$ ${servico.valor.toFixed(2).replace('.', ',')}`);
                });
            }
            
            return tooltipText;
        }
    };
    break;

        case 'custo-total-acumulado':
            labels = ['Custo Total'];
            data = [totaisAcumulados.TotalCusto];
            title = 'Custo Total Acumulado';
            chartType = 'bar';
            break;

        case 'lucro-total-acumulado':
            labels = ['Lucro Total Bruto'];
            data = [totaisAcumulados.TotalLucro];
            title = 'Lucro Total Bruto Acumulado';
            chartType = 'bar';
            break;

        default:
            return;
    }

    document.getElementById('chartTitle').textContent = title;
    const chartElement = document.getElementById('budgetChart');

    if (Chart.getChart(chartElement)) {
        Chart.getChart(chartElement).destroy();
    }

    // Configurações específicas para gráficos monetários
    const isMonetaryChart = metricId === 'valor-total-servicos' ||
        metricId === 'custo-total-acumulado' ||
        metricId === 'lucro-total-acumulado';

    new Chart(chartElement, {
        type: chartType,
        data: {
            labels,
            datasets: [{
                label: isMonetaryChart ? 'Valor (R$)' : 'Quantidade',
                data,
                backgroundColor: isMonetaryChart
                    ? (metricId === 'custo-total-acumulado' ? ['#dc3545'] :
                        metricId === 'lucro-total-acumulado' ? ['#0dcaf0'] :
                            ['#ffc107'])
                    : gerarCores(data.length),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: chartType === 'doughnut' ? 'right' : 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (isMonetaryChart) {
                                return `R$ ${parseFloat(context.raw).toFixed(2).replace('.', ',')}`;
                            }
                            return `${context.label}: ${context.raw} orçamentos`;
                        }
                    }
                }
            },
            scales: chartType === 'bar' ? {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            if (isMonetaryChart) {
                                return 'R$ ' + value.toFixed(2).replace('.', ',');
                            }
                            return value;
                        }
                    }
                }
            } : undefined
        }
    });
}

// ====================================================================
// FUNÇÃO AUXILIAR: Gerar Cores
// ====================================================================
function gerarCores(numCores) {
    const cores = [
        '#228F2F',  // Verde principal
        '#0a210c',  // Verde muito escuro  
        '#113815',  // Verde escuro
        '#bcdbbc'   // Verde claro
    ];
    return cores.slice(0, numCores);
}