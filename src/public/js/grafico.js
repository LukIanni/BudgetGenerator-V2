// ARQUIVO: grafico.js - VERSÃO COMPLETA COM NOVOS GRÁFICOS

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
            produtosMaisOrcadosV2Response,
            valorRealServicosResponse,
            valorRealProdutosResponse,
            custoTotalRealResponse
        ] = await Promise.all([
            fetch(`${API_BASE}/produtos-mais-orcados-v2`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/valor-real-servicos`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/valor-real-produtos`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE}/custo-total-real`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (
            produtosMaisOrcadosV2Response.status === 401 ||
            valorRealServicosResponse.status === 401 ||
            valorRealProdutosResponse.status === 401 ||
            custoTotalRealResponse.status === 401
        ) {
            alert('Sua sessão expirou. Faça login novamente.');
            localStorage.removeItem('token');
            window.location.href = '/';
            return;
        }

        if (
            !produtosMaisOrcadosV2Response.ok ||
            !valorRealServicosResponse.ok ||
            !valorRealProdutosResponse.ok ||
            !custoTotalRealResponse.ok
        ) {
            throw new Error('Erro ao carregar dados');
        }

        const produtosMaisOrcados = await produtosMaisOrcadosV2Response.json();
        const valorRealServicos = await valorRealServicosResponse.json();
        const valorRealProdutos = await valorRealProdutosResponse.json();
        const custoTotalReal = await custoTotalRealResponse.json();

        console.log('Dados carregados:', {
            produtosMaisOrcados,
            valorRealServicos,
            valorRealProdutos,
            custoTotalReal
        });

        const cardsData = [
            {
                id: 'total-orcamentos',
                icon: 'bi-list-ul',
                label: 'Orçamentos Totais',
                value: (valorRealProdutos.quantidade_produtos || 0) + (valorRealServicos.quantidade_servicos || 0),
                unit: 'unidades',
                color: 'primary'
            },
            {
                id: 'produtos-mais-orcados',
                icon: 'bi-cart-check',
                label: 'Produtos Mais Orçados',
                value: produtosMaisOrcados.length > 0 ? produtosMaisOrcados[0].contagem : 0,
                subtitle: produtosMaisOrcados.length > 0
                    ? `${produtosMaisOrcados[0].produto} - R$ ${formatarRS(produtosMaisOrcados[0].valor_total_acumulado)}`
                    : 'Nenhum produto',
                unit: 'orçamentos',
                color: 'info'
            },
            {
                id: 'valor-total-servicos',
                icon: 'bi-tools',
                label: 'Valor em Serviços',
                value: formatarRS(valorRealServicos.valor_total_servicos || 0),
                subtitle: `${valorRealServicos.quantidade_servicos || 0} serviços | Custo: R$ ${formatarRS(valorRealServicos.custo_servicos || 0)}`,
                unit: 'R$',
                color: 'warning'
            },
            {
                id: 'custo-total-real',
                icon: 'bi-calculator',
                label: 'Custo Total',
                value: formatarRS(custoTotalReal.total_custo || 0),
                subtitle: `Produtos: R$ ${formatarRS(custoTotalReal.custo_produtos)} | Serviços: R$ ${formatarRS(custoTotalReal.custo_servicos)}`,
                unit: 'R$',
                color: 'danger'
            },
            {
                id: 'lucro-total-bruto',
                icon: 'bi-piggy-bank',
                label: 'Lucro Bruto Total',
                value: formatarRS(custoTotalReal.total_lucro || 0),
                subtitle: `Produtos: R$ ${formatarRS(custoTotalReal.lucro_produtos)} | Serviços: R$ ${formatarRS(custoTotalReal.lucro_servicos)}`,
                unit: 'R$',
                color: 'success'
            },
            {
                id: 'valor-final-total',
                icon: 'bi-cash-stack',
                label: 'Total Faturado',
                value: formatarRS(custoTotalReal.valor_final_total || 0),
                subtitle: `Produtos: R$ ${formatarRS(custoTotalReal.breakdown.produtos.valor_final)} | Serviços: R$ ${formatarRS(custoTotalReal.breakdown.servicos.valor_final)}`,
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
                drawIndividualChart(metricId, produtosMaisOrcados, valorRealServicos, valorRealProdutos, custoTotalReal);
            });

            // Efeito hover
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
            });

            card.addEventListener('mouseleave', function () {
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
async function drawIndividualChart(metricId, produtosMaisOrcados, valorRealServicos, valorRealProdutos, custoTotalReal) {
    const metricsContainer = document.getElementById('metricsCardsContainer');
    const chartWrapper = document.getElementById('individualChartWrapper');

    if (metricsContainer) metricsContainer.style.display = 'none';
    if (chartWrapper) chartWrapper.style.display = 'block';

    let labels = [];
    let data = [];
    let title = '';
    let chartType = 'bar';
    let backgroundColor = [];
    let needsToggle = false;

    switch (metricId) {
        case 'total-orcamentos':
            labels = ['Produtos', 'Serviços'];
            data = [valorRealProdutos.quantidade_produtos || 0, valorRealServicos.quantidade_servicos || 0];
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
            data = top10.map(p => p.valor_total_acumulado || 0);
            title = 'Top 10 Produtos Mais Orçados (por Valor Total)';
            chartType = 'bar';
            backgroundColor = gerarCores(data.length);
            break;

        case 'valor-total-servicos':
            // Pegar dados de evolução temporal
            const token = localStorage.getItem('token');
            try {
                const evolucaoResponse = await fetch(`${API_BASE}/evolucao-temporal?tipo=mes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const evolucao = await evolucaoResponse.json();

                labels = evolucao.map(e => e.periodo);
                data = evolucao.map(e => e.valor_total);
                title = `Evolução de Serviços por Mês | Total: R$ ${formatarRS(valorRealServicos.valor_total_servicos)}`;
                chartType = 'line';
                backgroundColor = 'rgba(255, 193, 7, 0.2)';
                needsToggle = true;

                drawLineChart(labels, data, title, 'Valor Total (R$)');
                addToggleTemporalButton();
                return;
            } catch (error) {
                console.error('Erro ao carregar evolução:', error);
                title = 'Valor Total de Serviços';
                labels = ['Serviços'];
                data = [valorRealServicos.valor_total_servicos || 0];
                chartType = 'bar';
            }
            break;

        case 'custo-total-real':
            labels = ['Custo Real', 'Lucro Bruto'];
            data = [
                custoTotalReal.total_custo || 0,
                custoTotalReal.total_lucro || 0
            ];
            title = `Custo vs Lucro | Total: R$ ${formatarRS(custoTotalReal.valor_final_total || 0)}`;
            chartType = 'doughnut';
            backgroundColor = ['#dc3545', '#0dcaf0'];
            break;

        case 'lucro-total-bruto':
            labels = ['Produtos', 'Serviços'];
            data = [
                custoTotalReal.lucro_produtos || 0,
                custoTotalReal.lucro_servicos || 0
            ];
            const margem = custoTotalReal.total_custo > 0
                ? ((custoTotalReal.total_lucro / custoTotalReal.total_custo) * 100).toFixed(1)
                : 0;
            title = `Margem de Lucro: ${margem}% | Total: R$ ${formatarRS(custoTotalReal.total_lucro || 0)}`;
            chartType = 'doughnut';
            backgroundColor = ['#198754', '#ffc107'];
            break;

        case 'valor-final-total':
            labels = ['Custo Real', 'Lucro Adicionado'];
            data = [
                custoTotalReal.total_custo || 0,
                custoTotalReal.total_lucro || 0
            ];
            title = `Valor Total Faturado: R$ ${formatarRS(custoTotalReal.valor_final_total || 0)}`;
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
                borderRadius: 4,
                tension: 0.1 // Para line charts
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
                            return `${context.label}: ${context.raw}`;
                        }
                    },
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 }
                }
            },
            scales: chartType === 'bar' || chartType === 'line' ? {
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
// FUNÇÃO AUXILIAR: Desenhar Gráfico de Linha
// ====================================================================
function drawLineChart(labels, data, title, yAxisLabel) {
    const chartElement = document.getElementById('budgetChart');

    const existingChart = Chart.getChart(chartElement);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(chartElement, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: yAxisLabel,
                data,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#ffc107',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 12 }, padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `R$ ${formatarRS(context.raw)}`;
                        }
                    },
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + formatarRS(value);
                        }
                    }
                }
            }
        }
    });
}

// ====================================================================
// FUNÇÃO AUXILIAR: Adicionar Toggle para Temporal
// ====================================================================
function addToggleTemporalButton() {
    const buttonsContainer = document.querySelector('.d-flex.justify-content-center');
    if (buttonsContainer && !document.getElementById('toggleTemporalBtn')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggleTemporalBtn';
        toggleBtn.className = 'btn btn-sm btn-outline-primary me-2';
        toggleBtn.innerHTML = '<i class="bi bi-calendar-week me-1"></i> Mudar para Semana';

        toggleBtn.addEventListener('click', async function () {
            const token = localStorage.getItem('token');
            const tipo = this.innerHTML.includes('Semana') ? 'semana' : 'mes';
            const novoTipo = tipo === 'mes' ? 'semana' : 'mes';

            try {
                const response = await fetch(`${API_BASE}/evolucao-temporal?tipo=${novoTipo}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                const labels = data.map(e => e.periodo);
                const valores = data.map(e => e.valor_total);
                const title = `Evolução de Serviços por ${novoTipo === 'mes' ? 'Mês' : 'Semana'}`;

                drawLineChart(labels, valores, title, 'Valor Total (R$)');

                this.innerHTML = `<i class="bi bi-calendar-week me-1"></i> Mudar para ${novoTipo === 'mes' ? 'Semana' : 'Mês'}`;
            } catch (error) {
                console.error('Erro ao alternar período:', error);
            }
        });

        buttonsContainer.insertBefore(toggleBtn, buttonsContainer.firstChild);
    }
}

// ====================================================================
// FUNÇÃO AUXILIAR: Gerar Cores
// ====================================================================
function gerarCores(numCores) {
    const cores = [
        '#228F2F',  // Verde principal
        '#0a210c',  // Verde muito escuro  
        '#113815',  // Verde escuro
        '#bcdbbc',  // Verde claro
        '#3ea47d',  // Verde médio
        '#0d6efd',  // Azul
        '#198754',  // Verde bootstrap
        '#ffc107',  // Amarelo
        '#198754',  // Verde
        '#6f42c1'   // Roxo
    ];
    return cores.slice(0, numCores);
}
