const express = require('express');
const router = express.Router();

// Mock de integração com IA (substitua pelo serviço real depois)
router.post('/ia-orcamento', async (req, res) => {
  const dados = req.body;
  // Aqui você pode integrar com a IA do seu colega futuramente
  // Por enquanto, retorna os dados recebidos + mensagem mock
  res.json({
    mensagem: 'Orçamento processado pela IA (mock)',
    dadosRecebidos: dados
  });
});

module.exports = router;