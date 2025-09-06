const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Produto = sequelize.define('Produto', {
    id_produto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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
    },
    id_usuario: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    tableName: 'produto',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
});

module.exports = Produto;