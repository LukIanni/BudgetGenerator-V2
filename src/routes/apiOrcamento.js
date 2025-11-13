const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const geminiService = require('../services/geminiService');
const Produto = require('../models/produto');
const Servico = require('../models/servico');

// Middleware para proteger rotas
function protect(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}

// Rota para gerar orçamento
router.post('/', protect, async (req, res) => {
    try {
        const dados = req.body;

        // 1. Gerar resposta com IA
        const respostaIA = await geminiService.generateBudgetResponse(dados);

        // 2. Salvar no banco
        let registro;
        if (dados.nomeProduto) {
            registro = await Produto.create({
                descricao: dados.nomeProduto,
                horas: parseFloat(dados.horas),
                valor_hora: parseFloat(dados.valorHora),
                custo_extra: parseFloat(dados.custoExtra || 0),
                resposta: respostaIA,
                id_usuario: req.userId
            });
        } else {
            registro = await Servico.create({
                nome_servico: dados.nomeServico,
                materials: dados.materiaisServico,
                custo: parseFloat(dados.custoServico),
                lucro: parseFloat(dados.lucroServico),
                resposta: respostaIA,
                id_usuario: req.userId
            });
        }

        res.status(200).json({
            mensagem: 'Orçamento gerado com sucesso!',
            resposta: respostaIA,
            id: dados.nomeProduto ? registro.id_produto : registro.id_servico,
            tipo: dados.nomeProduto ? 'produto' : 'servico'
        });

    } catch (error) {
        console.error('ERRO FATAL NA ROTA /api/orcamento:', error.message || error); 
        console.error('Stack Trace:', error.stack);
        res.status(500).json({ erro: 'Erro ao gerar orçamento' });
    }
});

// Rota para obter os orçamentos do usuário logado
router.get('/meus-orcamentos', protect, async (req, res) => {
    try {
        const id_usuario = req.userId;

        // Busque os orçamentos de produtos e serviços do usuário
        const orcamentosProdutos = await Produto.findAll({
            where: { id_usuario },
            attributes: ['id_produto', 'descricao', 'data_criacao', 'resposta']
        });

        const orcamentosServicos = await Servico.findAll({
            where: { id_usuario },
            attributes: ['id_servico', 'nome_servico', 'data_criacao', 'resposta']
        });

        // Combine os dois arrays em um só, adicionando um tipo para diferenciação
        const todosOrcamentos = [
            ...orcamentosProdutos.map(p => ({
                id: p.id_produto,
                nome: p.descricao,
                data: p.data_criacao,
                resposta: p.resposta,
                tipo: 'produto'
            })),
            ...orcamentosServicos.map(s => ({
                id: s.id_servico,
                nome: s.nome_servico,
                data: s.data_criacao,
                resposta: s.resposta,
                tipo: 'servico'
            }))
        ];

        //ordene por data de criação
        todosOrcamentos.sort((a, b) => new Date(b.data) - new Date(a.data));

        res.status(200).json(todosOrcamentos);
    } catch (error) {
        console.error('Erro ao buscar orçamentos do usuário:', error);
        res.status(500).json({ erro: 'Erro ao buscar orçamentos' });
    }
});


// Rota para obter um resumo de contagem de orçamentos
router.get('/resumo-contagem', protect, async (req, res) => {
    try {
        const id_usuario = req.userId;

        // 1. Contar Orçamentos de Produto
        const contagemProdutos = await Produto.count({
            where: { id_usuario }
        });

        // 2. Contar Orçamentos de Serviço
        const contagemServicos = await Servico.count({
            where: { id_usuario }
        });

        // 3. Enviar a resposta formatada
        res.status(200).json({
            Produto: contagemProdutos,
            Servico: contagemServicos,
            Total: contagemProdutos + contagemServicos
        });

    } catch (error) {
        console.error('Erro ao buscar resumo de orçamentos:', error);
        res.status(500).json({ erro: 'Erro ao buscar dados para o gráfico' });
    }
});

// ARQUIVO: apiOrcamento.js (Inserir este bloco)

// Rota para obter o Custo Médio de Produtos e Serviços
router.get('/custo-medio', protect, async (req, res) => {
    try {
        const id_usuario = req.userId;

        // --- CÁLCULO DO PRODUTO ---
        const totalProdutos = await Produto.count({ where: { id_usuario } });
        
        // Sumariza as horas, valor_hora e custo_extra (Sequelize não permite SUM de expressão direta)
        // Buscamos todos os produtos para calcular o custo total individualmente no loop
        const produtos = await Produto.findAll({
            where: { id_usuario },
            attributes: ['horas', 'valor_hora', 'custo_extra']
        });

        let custoTotalProdutos = 0;
        produtos.forEach(p => {
            // Lógica: (horas * valor_hora) + custo_extra
            const horas = parseFloat(p.horas) || 0;
            const valor_hora = parseFloat(p.valor_hora) || 0;
            const custo_extra = parseFloat(p.custo_extra) || 0;
            custoTotalProdutos += (horas * valor_hora) + custo_extra;
        });

        const custoMedioProduto = totalProdutos > 0 ? custoTotalProdutos / totalProdutos : 0;


        // --- CÁLCULO DO SERVIÇO ---
        const totalServicos = await Servico.count({ where: { id_usuario } });
        // Sumariza o campo 'custo' (assumindo que 'custo' representa o custo base do serviço)
        const custoTotalServicos = await Servico.sum('custo', { 
            where: { id_usuario }
        });

        const custoMedioServico = totalServicos > 0 ? (custoTotalServicos / totalServicos) : 0;

        // Enviar a resposta
        res.status(200).json({
            Produto: custoMedioProduto,
            Servico: custoMedioServico,
            unidade: 'R$' // Adiciona a unidade
        });

    } catch (error) {
        console.error('Erro ao buscar custo médio:', error);
        res.status(500).json({ erro: 'Erro ao buscar dados de custo médio' });
    }
});

router.get('/totais-acumulados', protect, async (req, res) => {
    try {
        const id_usuario = req.userId;

        // --- CÁLCULOS TOTAIS PRODUTO ---
        // Buscamos todos os produtos para calcular o valor final e lucro
        const produtos = await Produto.findAll({
            where: { id_usuario },
            attributes: ['horas', 'valor_hora', 'custo_extra']
        });

        let totalCustoProduto = 0; // Materiais + Mão de Obra
        let totalLucroProduto = 0;
        
        produtos.forEach(p => {
            const horas = parseFloat(p.horas) || 0;
            const valorHora = parseFloat(p.valor_hora) || 0;
            const custoExtra = parseFloat(p.custo_extra) || 0;
            
            const custoMaoDeObra = horas * valorHora;
            const custoMateriais = custoExtra;
            const custoTotalItem = custoMateriais + custoMaoDeObra;

            // Assumindo Margem de Lucro FIXA de 35% para produtos (baseado no seu exemplo)
            const margemLucroPercentual = 0.35; 
            const valorLucroItem = custoTotalItem * margemLucroPercentual;
            
            totalCustoProduto += custoTotalItem;
            totalLucroProduto += valorLucroItem;
        });

        const valorFinalTotalProduto = totalCustoProduto + totalLucroProduto;

        // --- CÁLCULOS TOTAIS SERVIÇO ---
        // O Serviço tem campos mais claros: custo e lucro
        const totalCustoServico = await Servico.sum('custo', { where: { id_usuario } });
        const totalLucroServico = await Servico.sum('lucro', { where: { id_usuario } }); 
        
        const totalCustoServicoNum = parseFloat(totalCustoServico) || 0;
        const totalLucroServicoNum = parseFloat(totalLucroServico) || 0;

        // Valor Final = Custo + Lucro
        const valorFinalTotalServico = totalCustoServicoNum + totalLucroServicoNum;

        // --- TOTAIS GERAIS ---
        res.status(200).json({
            TotalCusto: totalCustoProduto + totalCustoServicoNum,
            TotalLucro: totalLucroProduto + totalLucroServicoNum,
            ValorFinalTotal: valorFinalTotalProduto + valorFinalTotalServico
        });

    } catch (error) {
        console.error('Erro ao buscar totais acumulados:', error);
        res.status(500).json({ erro: 'Erro ao buscar dados totais para o dashboard' });
    }
});


// ARQUIVO: apiOrcamento.js (Nova Rota para Detalhamento de Custos)

// Rota para obter a composição detalhada de custo para um produto
router.get('/composicao-custo/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Busca o produto pelo ID e verifica o usuário
        const produto = await Produto.findOne({
            where: { id_produto: id, id_usuario: req.userId },
            attributes: ['horas', 'valor_hora', 'custo_extra'] 
        });

        if (!produto) {
            return res.status(404).json({ erro: 'Produto não encontrado ou acesso negado.' });
        }

        // --- CÁLCULOS ---
        const horas = parseFloat(produto.horas) || 0;
        const valorHora = parseFloat(produto.valor_hora) || 0;
        const custoExtra = parseFloat(produto.custo_extra) || 0;
        
        const custoMaoDeObra = horas * valorHora;
        const custoMateriais = custoExtra; // Usando custo_extra como proxy para custo de materiais
        
        // Nota: Você pode precisar ajustar esta lógica se o seu modelo Produto tiver um campo 'custo_materiais'
        const custoTotal = custoMateriais + custoMaoDeObra;

        // Assumindo Margem de Lucro de 35% como no seu exemplo (você pode buscar isso do BD se tiver o campo)
        const margemLucroPercentual = 0.35; 
        const valorLucro = custoTotal * margemLucroPercentual;
        
        const valorFinal = custoTotal + valorLucro;
        
        // 3. Enviar a resposta formatada para o gráfico
        res.status(200).json({
            valor_final: valorFinal,
            CustoBase: custoMateriais, 
            MaoDeObra: custoMaoDeObra,
            Lucro: valorLucro
        });

    } catch (error) {
        console.error('Erro ao buscar composição de custo:', error);
        res.status(500).json({ erro: 'Erro ao buscar dados de composição de custo' });
    }
});




// Rota para visualizar a resposta de um orçamento específico
router.get('/resposta/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.query;

    let registro;
    try {
        if (tipo === 'produto') {
            registro = await Produto.findOne({
                where: { 
                    id_produto: id,
                    id_usuario: req.userId 
                }
            });
        } else if (tipo === 'servico') {
            registro = await Servico.findOne({
                where: { 
                    id_servico: id,
                    id_usuario: req.userId 
                }
            });
        } else {
            return res.status(400).json({ erro: 'Tipo de orçamento inválido.' });
        }

        if (!registro) {
            return res.status(404).json({ erro: 'Orçamento não encontrado' });
        }

        res.send(registro.resposta || 'Nenhuma resposta disponível para este orçamento.');
    } catch (error) {
        console.error('Erro ao buscar resposta:', error);
        res.status(500).json({ erro: 'Erro ao buscar resposta do orçamento' });
    }
});

// Rota para excluir um orçamento
// Rota para atualizar a resposta de um orçamento
router.put('/atualizar-resposta/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.query;
    const { resposta } = req.body;

    if (!resposta) {
        return res.status(400).json({ erro: 'A resposta é obrigatória' });
    }

    try {
        let atualizado = 0;

        if (tipo === 'produto') {
            atualizado = await Produto.update(
                { resposta },
                { 
                    where: { 
                        id_produto: id,
                        id_usuario: req.userId 
                    }
                }
            );
        } else if (tipo === 'servico') {
            atualizado = await Servico.update(
                { resposta },
                { 
                    where: { 
                        id_servico: id,
                        id_usuario: req.userId 
                    }
                }
            );
        } else {
            return res.status(400).json({ erro: 'Tipo de orçamento inválido.' });
        }

        if (atualizado[0] === 0) {
            return res.status(404).json({ 
                erro: 'Orçamento não encontrado ou você não tem permissão para editá-lo' 
            });
        }

        res.json({ 
            mensagem: 'Resposta atualizada com sucesso',
            resposta: resposta
        });
    } catch (error) {
        console.error('Erro ao atualizar resposta:', error);
        res.status(500).json({ erro: 'Erro ao atualizar a resposta do orçamento' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.query;

    try {
        let registro;
        let deletado = 0;

        if (tipo === 'produto') {
            deletado = await Produto.destroy({
                where: { 
                    id_produto: id,
                    id_usuario: req.userId 
                }
            });
        } else if (tipo === 'servico') {
            deletado = await Servico.destroy({
                where: { 
                    id_servico: id,
                    id_usuario: req.userId 
                }
            });
        } else {
            return res.status(400).json({ erro: 'Tipo de orçamento inválido.' });
        }

        if (deletado === 0) {
            return res.status(404).json({ erro: 'Orçamento não encontrado ou você não tem permissão para excluí-lo' });
        }

        res.json({ mensagem: 'Orçamento excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        res.status(500).json({ erro: 'Erro ao excluir orçamento' });
    }
});


// module.exports = router; <--- Garanta que esta linha vem depois de todas as rotas

module.exports = router;