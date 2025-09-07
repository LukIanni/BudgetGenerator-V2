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
            attributes: ['id', 'descricao', 'createdAt', 'pdf_path'] // Selecione os campos necessários
        });

        const orcamentosServicos = await Servico.findAll({
            where: { id_usuario },
            attributes: ['id', 'nome_servico', 'createdAt', 'pdf_path'] // Selecione os campos necessários
        });

        // Combine os dois arrays em um só, adicionando um tipo para diferenciação
        const todosOrcamentos = [
            ...orcamentosProdutos.map(p => ({
                id: p.id,
                nome: p.descricao,
                data: p.createdAt,
                pdf_path: p.pdf_path,
                tipo: 'produto'
            })),
            ...orcamentosServicos.map(s => ({
                id: s.id,
                nome: s.nome_servico,
                data: s.createdAt,
                pdf_path: s.pdf_path,
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

// Rota para download do PDF
router.get('/download/:id', async (req, res) => {
    const { id } = req.params;
    const { tipo } = req.query;

    let registro;
    if (tipo === 'produto') {
        registro = await Produto.findByPk(id);
    } else {
        registro = await Servico.findByPk(id);
    }

    if (!registro || !registro.pdf_path) {
        return res.status(404).send('PDF não encontrado');
    }

    res.download(registro.pdf_path);
});

module.exports = router;
