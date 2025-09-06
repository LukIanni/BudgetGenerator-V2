const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Produto = require('../models/produto');
const Servico = require('../models/servico');
const geminiService = require('../services/geminiService');
const { protect } = require('../middleware/authMiddleware');

// Rota para salvar um novo orçamento de produto ou serviço
router.post('/orcamentos', protect, async (req, res) => {
  try {
    const dados = req.body;
    let novoOrcamento;

    // Pega o ID do usuário do token JWT
    const token = req.headers.authorization?.split(' ')[1];
    let idUsuario;
    
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        idUsuario = decoded.id;
    } else {
        return res.status(401).json({ success: false, error: "Usuário não autenticado" });
    }

    // Gerar resposta com Gemini
    const iaResponse = await geminiService.generateBudgetResponse(dados);

    // Lógica para identificar se é um produto ou serviço
    if (dados.nomeProduto) {
      novoOrcamento = await Produto.create({
        descricao: dados.nomeProduto,
        horas: parseFloat(dados.horas),
        valor_hora: parseFloat(dados.valorHora),
        custo_extra: parseFloat(dados.custoExtra || 0),
        resposta: iaResponse,
        id_usuario: idUsuario
      });
    } else if (dados.nomeServico) {
      novoOrcamento = await Servico.create({
        nome_servico: dados.nomeServico,
        materials: dados.materiaisServico,
        custo: parseFloat(dados.custoServico),
        lucro: parseFloat(dados.lucroServico),
        resposta: iaResponse,
        id_usuario: idUsuario
      });
    } else {
      return res.status(400).json({ success: false, error: "Dados inválidos." });
    }

    res.status(200).json({
      success: true,
      orcamentoId: novoOrcamento.id,
      resposta: iaResponse
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao salvar o orçamento." });
  }
});

// Nova rota para buscar um orçamento pelo ID
// Nova rota para buscar TODOS os orçamentos (sem ID)
router.get('/orcamentos', async (req, res) => {
  try {
    const produtos = await Produto.findAll();
    const servicos = await Servico.findAll();

    const todosOrcamentos = {
      produtos: produtos,
      servicos: servicos
    };

    res.status(200).json(todosOrcamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar os orçamentos." });
  }
});

module.exports = router;