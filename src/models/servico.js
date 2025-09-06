const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Servico = sequelize.define('Servico', {
    id_servico: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome_servico: {
        type: DataTypes.STRING,
        allowNull: false
    },
    materials: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    custo: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    lucro: {
        type: DataTypes.FLOAT,
        allowNull: false
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
    tableName: 'servico',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
});

module.exports = Servico;