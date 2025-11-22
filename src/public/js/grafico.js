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
                id: 'custo-total-real',
                icon: 'bi-calculator',
                label: 'Custo Total Real',
                value: `R$ ${formatarRS(totaisAcumulados.TotalCusto)}`,
                subtitle: 'Mão de obra + Materiais',
                unit: '',
                color: 'danger',
                data: totaisAcumulados
            },
            {
                id: 'lucro-total-bruto',
                icon: 'bi-piggy-bank',
                label: 'Lucro Total Bruto',
                value: `R$ ${formatarRS(totaisAcumulados.TotalLucro)}`,
                subtitle: 'Margem aplicada sobre custos',
                unit: '',
                color: 'success',
                data: totaisAcumulados
            },
            {
                id: 'valor-final-total',
                icon: 'bi-cash-stack',
                label: 'Valor Total Faturado',
                value: `R$ ${formatarRS(totaisAcumulados.ValorFinalTotal)}`,
                subtitle: 'O que o cliente paga',
                unit: '',
                color: 'primary',
                data: totaisAcumulados
            }
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
            labels = ['Produtos', 'Serviços'];
            data = [contagem.Produto, contagem.Servico];
            title = 'Distribuição: Produtos vs Serviços';
            chartType = 'doughnut';
            break;

        case 'produtos-mais-orcados':
            const top10 = produtosMaisOrcados.slice(0, 10);
            labels = top10.map(p => p.produto.length > 30 ? p.produto.substring(0, 27) + '...' : p.produto);
            data = top10.map(p => p.contagem);
            title = 'Top 10 Produtos Mais Orçados';
            chartType = 'bar';
            break;

        case 'valor-total-servicos':
            labels = ['Período Atual', 'Período Anterior'];
            data = [valorTotalServicos.valorTotal, valorTotalServicos.valorAnterior];
            title = `Serviços: ${valorTotalServicos.variacaoPercentual > 0 ? 'Aumento' : 'Queda'} de ${Math.abs(valorTotalServicos.variacaoPercentual).toFixed(1)}%`;
            chartType = 'bar';
            break;

        // NOVOS CARDS — AQUI ESTÁ A SOLUÇÃO!
        case 'custo-total-real':
            labels = ['Custo Real (Tudo)', 'Lucro Bruto'];
            data = [totaisAcumulados.TotalCusto, totaisAcumulados.TotalLucro];
            title = 'Custo Real vs Lucro Bruto';
            chartType = 'doughnut';
            break;

        case 'lucro-total-bruto':
            labels = ['Lucro sobre Produtos', 'Lucro sobre Serviços'];
            // Estimando (se quiser exato, adicione no backend)
            const lucroProduto = totaisAcumulados.TotalLucro * 0.7;  // exemplo
            const lucroServico = totaisAcumulados.TotalLucro * 0.3;
            data = [lucroProduto, lucroServico];
            title = 'Origem do Lucro Bruto';
            chartType = 'doughnut';
            break;

        case 'valor-final-total':
            labels = ['Custo Real', 'Lucro Adicionado'];
            data = [totaisAcumulados.TotalCusto, totaisAcumulados.TotalLucro];
            title = `Valor Total Faturado: R$ ${formatarRS(totaisAcumulados.ValorFinalTotal)}`;
            chartType = 'doughnut';
            break;

        default:
            return; // não faz nada
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