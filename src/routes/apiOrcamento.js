const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const geminiService = require('../services/geminiService');
const { generateBudgetPdf } = require('../services/pdfService');
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
        const iaResponse = await geminiService.generateBudgetResponse(dados);

        // 2. Gerar PDF
        const pdfPath = await generateBudgetPdf(dados, iaResponse);

        // 3. Salvar no banco
        let registro;
        if (dados.nomeProduto) {
            registro = await Produto.create({
                descricao: dados.nomeProduto,
                horas: parseFloat(dados.horas),
                valor_hora: parseFloat(dados.valorHora),
                custo_extra: parseFloat(dados.custoExtra || 0),
                resposta: iaResponse,
                pdf_path: pdfPath,
                id_usuario: req.userId
            });
        } else {
            registro = await Servico.create({
                nome_servico: dados.nomeServico,
                materials: dados.materiaisServico,
                custo: parseFloat(dados.custoServico),
                lucro: parseFloat(dados.lucroServico),
                resposta: iaResponse,
                pdf_path: pdfPath,
                id_usuario: req.userId
            });
        }

        // 4. Retorna link para download
        res.status(200).json({
            mensagem: 'Orçamento gerado com sucesso!',
            resposta: iaResponse,
            pdfDownloadUrl: `/download/${registro.id}?tipo=${dados.nomeProduto ? 'produto' : 'servico'}`
        });

    } catch (error) {
        console.error(error);
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

// Rota para visualizar o PDF
router.get('/view/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.query;

    let registro;
    try {
        if (tipo === 'produto') {
            registro = await Produto.findOne({
                where: { id_produto: id }
            });
        } else if (tipo === 'servico') {
            registro = await Servico.findOne({
                where: { id_servico: id }
            });
        } else {
            return res.status(400).json({ erro: 'Tipo de orçamento inválido.' });
        }

        if (!registro || !registro.pdf_path) {
            return res.status(404).json({ erro: 'PDF não encontrado ou não gerado para este orçamento.' });
        }

        // Envie o arquivo PDF com content-type apropriado para visualização
        res.contentType('application/pdf');
        res.sendFile(registro.pdf_path);

    } catch (error) {
        console.error('Erro ao tentar visualizar PDF:', error);
        res.status(500).json({ erro: 'Erro interno ao tentar visualizar o PDF.' });
    }
});

// Rota para download do PDF
router.get('/download/:id', protect, async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.query;

    let registro;
    try {
        if (tipo === 'produto') {
            registro = await Produto.findOne({
                where: { id_produto: id }
            });
        } else if (tipo === 'servico') {
            registro = await Servico.findOne({
                where: { id_servico: id }
            });
        } else {
            return res.status(400).json({ erro: 'Tipo de orçamento inválido.' });
        }

        if (!registro || !registro.pdf_path) {
            return res.status(404).json({ erro: 'PDF não encontrado ou não gerado para este orçamento.' });
        }

        // Force o download do arquivo
        res.download(registro.pdf_path, `${registro.nome || registro.nome_servico || 'orcamento'}-${id}.pdf`);

    } catch (error) {
        console.error('Erro ao tentar baixar PDF:', error);
        res.status(500).json({ erro: 'Erro interno ao tentar baixar o PDF.' });
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

module.exports = router;
