// ARQUIVO: grafico.js

const API_BASE = '/api/orcamento';

// ====================================================================
// FUNÇÃO AUXILIAR: Formatar valor em Real
// ====================================================================
const formatarRS = (valor) => {
    const num = parseFloat(valor) || 0;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ====================================================================
// FUNÇÃO PRINCIPAL: Carrega dados e Desenha Cards
// ====================================================================
async function loadAndDrawMetricsCards() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa fazer login novamente.');
        window.location.href = '/';
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
            window.location.href = '/';
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

        console.log('Dados carregados:', {
            resumoContagem,
            produtosMaisOrcados,
            totaisAcumulados,
            valorTotalServicos
        });

        const cardsData = [
            {
                id: 'total-orcamentos',
                icon: 'bi-list-ul',
                label: 'Orçamentos Totais',
                value: resumoContagem.Total || 0,
                unit: 'unidades',
                color: 'primary'
            },
            {
                id: 'produtos-mais-orcados',
                icon: 'bi-cart-check',
                label: 'Produtos Mais Orçados',
                value: produtosMaisOrcados.length > 0
                    ? produtosMaisOrcados[0].contagem
                    : 0,
                subtitle: produtosMaisOrcados.length > 0
                    ? produtosMaisOrcados[0].produto
                    : 'Nenhum produto',
                unit: 'orçamentos',
                color: 'info'
            },
            {
                id: 'valor-total-servicos',
                icon: 'bi-tools',
                label: 'Valor em Serviços',
                value: formatarRS(valorTotalServicos.valorTotal || 0),
                subtitle: `${valorTotalServicos.quantidadeServicos || 0} serviços (${(valorTotalServicos.variacaoPercentual || 0).toFixed(1)}%)`,
                unit: 'R$',
                color: 'warning'
            },
            {
                id: 'custo-total-real',
                icon: 'bi-calculator',
                label: 'Custo Total',
                value: formatarRS(totaisAcumulados.TotalCusto || 0),
                subtitle: 'Mão de obra + Materiais',
                unit: 'R$',
                color: 'danger'
            },
            {
                id: 'lucro-total-bruto',
                icon: 'bi-piggy-bank',
                label: 'Lucro Bruto',
                value: formatarRS(totaisAcumulados.TotalLucro || 0),
                subtitle: 'Margem de ganho',
                unit: 'R$',
                color: 'success'
            },
            {
                id: 'valor-final-total',
                icon: 'bi-cash-stack',
                label: 'Total Faturado',
                value: formatarRS(totaisAcumulados.ValorFinalTotal || 0),
                subtitle: 'Custo + Lucro',
                unit: 'R$',
                color: 'secondary'
            }
        ];

        const container = document.getElementById('metricsCardsContainer');
        container.innerHTML = '';
        container.className = 'row g-3';

        cardsData.forEach(data => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-12';
            col.innerHTML = `
                <div class="card bg-${data.color} text-white shadow-sm metric-card h-100" data-metric-id="${data.id}" style="cursor: pointer; transition: all 0.3s ease;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex align-items-center mb-3">
                            <i class="bi ${data.icon} fs-3 me-3 flex-shrink-0"></i>
                            <h6 class="card-subtitle mb-0" style="font-size: 0.9rem; font-weight: 500;">${data.label}</h6>
                        </div>
                        <h3 class="card-title mt-2 mb-2" style="font-size: 1.8rem; font-weight: bold;">${data.value}</h3>
                        <p class="card-text mb-2" style="font-size: 0.85rem; opacity: 0.9;">${data.unit}</p>
                        ${data.subtitle ? `<small class="mt-auto" style="font-size: 0.8rem; opacity: 0.85; line-height: 1.3;">${data.subtitle}</small>` : ''}
                        <small class="text-white-50 mt-3" style="font-size: 0.75rem;">↓ Clique para detalhes</small>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });

        // Adicionar event listeners aos cards
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('click', function () {
                const metricId = this.getAttribute('data-metric-id');
                drawIndividualChart(metricId, resumoContagem, produtosMaisOrcados, totaisAcumulados, valorTotalServicos);
            });
            
            // Efeito hover
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });

    } catch (err) {
        console.error('Erro ao carregar métricas:', err);
        const container = document.getElementById('metricsCardsContainer');
        container.innerHTML = `<div class="alert alert-danger w-100">Erro ao carregar estatísticas. Tente novamente.</div>`;
    }
}

// ====================================================================
// FUNÇÃO DE DETALHE: Desenha o Gráfico Individual
// ====================================================================
function drawIndividualChart(metricId, contagemData, produtosMaisOrcados, totaisAcumulados, valorTotalServicos) {
    const metricsContainer = document.getElementById('metricsCardsContainer');
    const chartWrapper = document.getElementById('individualChartWrapper');
    
    if (metricsContainer) metricsContainer.style.display = 'none';
    if (chartWrapper) chartWrapper.style.display = 'block';

    let labels = [];
    let data = [];
    let title = '';
    let chartType = 'bar';
    let backgroundColor = [];

    switch (metricId) {
        case 'total-orcamentos':
            labels = ['Produtos', 'Serviços'];
            data = [contagemData.Produto || 0, contagemData.Servico || 0];
            title = 'Distribuição: Produtos vs Serviços';
            chartType = 'doughnut';
            backgroundColor = ['#0d6efd', '#198754'];
            break;

        case 'produtos-mais-orcados':
            const top10 = (produtosMaisOrcados || []).slice(0, 10);
            labels = top10.map(p => 
                (p.produto || 'Sem nome').length > 25 
                    ? (p.produto || 'Sem nome').substring(0, 22) + '...' 
                    : (p.produto || 'Sem nome')
            );
            data = top10.map(p => p.contagem || 0);
            title = 'Top 10 Produtos Mais Orçados';
            chartType = 'bar';
            backgroundColor = gerarCores(data.length);
            break;

        case 'valor-total-servicos':
            labels = ['Período Atual', 'Período Anterior'];
            data = [
                parseFloat(valorTotalServicos.valorTotal) || 0,
                parseFloat(valorTotalServicos.valorAnterior) || 0
            ];
            title = `Serviços: ${valorTotalServicos.variacaoPercentual > 0 ? '📈 Aumento' : '📉 Queda'} de ${Math.abs(valorTotalServicos.variacaoPercentual || 0).toFixed(1)}%`;
            chartType = 'bar';
            backgroundColor = ['#ffc107', '#6c757d'];
            break;

        case 'custo-total-real':
            labels = ['Custo Total', 'Lucro Bruto'];
            data = [
                parseFloat(totaisAcumulados.TotalCusto) || 0,
                parseFloat(totaisAcumulados.TotalLucro) || 0
            ];
            title = `Custo vs Lucro | Total: R$ ${formatarRS(totaisAcumulados.ValorFinalTotal || 0)}`;
            chartType = 'doughnut';
            backgroundColor = ['#dc3545', '#0dcaf0'];
            break;

        case 'lucro-total-bruto':
            labels = ['Custo Real', 'Lucro Bruto'];
            const custoPorcentagem = parseFloat(totaisAcumulados.TotalCusto) || 1;
            const lucroPorcentagem = parseFloat(totaisAcumulados.TotalLucro) || 0;
            data = [custoPorcentagem, lucroPorcentagem];
            const margem = custoPorcentagem > 0 ? ((lucroPorcentagem / custoPorcentagem) * 100).toFixed(1) : 0;
            title = `Margem de Lucro: ${margem}% | Lucro Total: R$ ${formatarRS(lucroPorcentagem)}`;
            chartType = 'doughnut';
            backgroundColor = ['#dc3545', '#198754'];
            break;

        case 'valor-final-total':
            labels = ['Custo Real', 'Lucro Adicionado'];
            data = [
                parseFloat(totaisAcumulados.TotalCusto) || 0,
                parseFloat(totaisAcumulados.TotalLucro) || 0
            ];
            title = `Valor Total Faturado: R$ ${formatarRS(totaisAcumulados.ValorFinalTotal || 0)}`;
            chartType = 'doughnut';
            backgroundColor = ['#6c757d', '#198754'];
            break;

        default:
            title = 'Gráfico não disponível';
            return;
    }

    const chartTitle = document.getElementById('chartTitle');
    if (chartTitle) {
        chartTitle.textContent = title;
    }

    const chartElement = document.getElementById('budgetChart');
    if (!chartElement) {
        console.error('Elemento canvas "budgetChart" não encontrado');
        return;
    }

    // Destruir gráfico anterior se existir
    const existingChart = Chart.getChart(chartElement);
    if (existingChart) {
        existingChart.destroy();
    }

    // Determinar se é gráfico monetário
    const isMonetaryChart = ['valor-total-servicos', 'custo-total-real', 'lucro-total-bruto', 'valor-final-total'].includes(metricId);

    // Criar novo gráfico
    new Chart(chartElement, {
        type: chartType,
        data: {
            labels,
            datasets: [{
                label: isMonetaryChart ? 'Valor (R$)' : 'Quantidade',
                data,
                backgroundColor: backgroundColor,
                borderColor: '#ffffff',
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: chartType === 'doughnut' ? 'bottom' : 'top',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (isMonetaryChart) {
                                const valor = parseFloat(context.raw) || 0;
                                return `R$ ${formatarRS(valor)}`;
                            }
                            return `${context.label}: ${context.raw} orçamentos`;
                        }
                    },
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 }
                }
            },
            scales: chartType === 'bar' ? {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function (value) {
                            if (isMonetaryChart) {
                                return 'R$ ' + formatarRS(value);
                            }
                            return value;
                        },
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
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