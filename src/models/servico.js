const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Corrigido o caminho do arquivo de configuração

const Servico = sequelize.define('Servico', {
    nomeServico: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valorBase: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    horasEstimadas: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    materiaisServico: {
        type: DataTypes.STRING,
        allowNull: false
    },
    custoServico: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    lucroServico: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    descricaoServico: {
        type: DataTypes.TEXT
    },
    respostaServico: {
        type: DataTypes.TEXT
    }
    // id_usuario pode ser adicionado se necessário
});

module.exports = Servico;