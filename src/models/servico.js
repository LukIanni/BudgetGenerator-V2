const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Servico = sequelize.define('Servico', {
    nome_servico: { // Corrigido para 'nome_servico'
        type: DataTypes.STRING,
        allowNull: false
    },
    materials: { // Corrigido para 'materials'
        type: DataTypes.TEXT,
        allowNull: true
    },
    custo: { // Corrigido para 'custo'
        type: DataTypes.FLOAT,
        allowNull: false
    },
    lucro: { // Corrigido para 'lucro'
        type: DataTypes.FLOAT,
        allowNull: false
    },
    resposta: { // Corrigido para 'resposta'
        type: DataTypes.TEXT
    }
    // As colunas valorBase, horasEstimadas e descricaoServico
    // não existem no seu SQL, então foram removidas.
    // id_usuario pode ser adicionado se necessário
});

module.exports = Servico;