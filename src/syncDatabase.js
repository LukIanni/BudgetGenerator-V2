const sequelize = require('./config/database');

// Importar todos os modelos aqui
const User = require('./models/user');
const Produto = require('./models/produto');
const Servico = require('./models/servico');

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        // Define as associações entre os modelos
        User.hasMany(Produto, { foreignKey: 'id_usuario' });
        User.hasMany(Servico, { foreignKey: 'id_usuario' });
        Produto.belongsTo(User, { foreignKey: 'id_usuario' });
        Servico.belongsTo(User, { foreignKey: 'id_usuario' });

        // Sincroniza todos os modelos com o banco de dados
        await sequelize.sync();
        console.log('Modelos sincronizados com o banco de dados.');
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
        throw error; // Propaga o erro para ser tratado no index.js
    }
};

module.exports = syncDatabase;
