const express = require('express');
const router = express.Router();
const Produto = require('../models/produto');
const Servico = require('../models/servico');

// Rota para salvar um novo orçamento de produto ou serviço
router.post('/orcamentos', async (req, res) => {
  try {
    const dados = req.body;
    let novoOrcamento;

    // TODO: Em uma aplicação real, o id_usuario viria do token de autenticação
    // Por enquanto, usaremos um valor fixo para a demonstração
    const idUsuario = 1;

    // Lógica para identificar se é um produto ou serviço
    if (dados.nomeProduto) {
      novoOrcamento = await Produto.create({
        descricao: dados.nomeProduto,
        horas: dados.horas,
        valor_hora: dados.valorHora,
        custo_extra: dados.custoExtra,
        resposta: dados.resposta,
        id_usuario: idUsuario // Adiciona o ID do usuário aqui
      });
    } else if (dados.nomeServico) {
      novoOrcamento = await Servico.create({
        nome_servico: dados.nomeServico,
        materials: dados.materiaisServico,
        custo: dados.custoServico,
        lucro: dados.lucroServico,
        resposta: dados.respostaServico,
        id_usuario: idUsuario // Adiciona o ID do usuário aqui
      });
    } else {
      return res.status(400).json({ mensagem: "Dados inválidos." });
    }

    res.status(201).json({
      mensagem: "Orçamento salvo com sucesso!",
      orcamentoId: novoOrcamento.id // Retorna o ID do novo registro
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao salvar o orçamento." });
  }
});

// Nova rota para buscar um orçamento pelo ID
router.get('/orcamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let orcamentoEncontrado;

    // Tenta encontrar o orçamento em ambas as tabelas (Produto e Servico)
    orcamentoEncontrado = await Produto.findByPk(id);
    if (!orcamentoEncontrado) {
      orcamentoEncontrado = await Servico.findByPk(id);
    }
    
    if (!orcamentoEncontrado) {
      return res.status(404).json({ mensagem: "Orçamento não encontrado." });
    }

    res.status(200).json(orcamentoEncontrado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar o orçamento." });
  }
});

module.exports = router;