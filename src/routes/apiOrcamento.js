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

// Rota para buscar um produto pelo ID
router.get('/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produto = await Produto.findByPk(id);

    if (produto) {
      res.status(200).json(produto);
    } else {
      res.status(404).json({ mensagem: "Produto não encontrado." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar o produto." });
  }
});

// Rota para buscar um serviço pelo ID
router.get('/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const servico = await Servico.findByPk(id);

    if (servico) {
      res.status(200).json(servico);
    } else {
      res.status(404).json({ mensagem: "Serviço não encontrado." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar o serviço." });
  }
});

module.exports = router;