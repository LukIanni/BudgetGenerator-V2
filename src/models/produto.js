const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Corrigido o caminho do arquivo de configuração

const Produto = sequelize.define('Produto', {
    nomeProduto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    custoProducao: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    materiaisUtilizados: {
        type: DataTypes.STRING,
        allowNull: false
    },
    margemLucro: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    horas: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    valorHora: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    custoExtra: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    resposta: {
        type: DataTypes.TEXT
    }
    // id_usuario pode ser adicionado se necessário
});

module.exports = Produto;