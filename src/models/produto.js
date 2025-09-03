const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
    descricao: { 
        type: DataTypes.TEXT,
        allowNull: false
    },
    horas: {
        type: DataTypes.FLOAT,
        allowNull: true 
    },
    valor_hora: { 
        type: DataTypes.FLOAT,
        allowNull: true
    },
    custo_extra: { 
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    resposta: {
        type: DataTypes.TEXT
    }
    // id_usuario pode ser adicionado se necessário
});

module.exports = Produto;