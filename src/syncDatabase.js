const sequelize = require('./config/database');

// Importar todos os modelos aqui
const User = require('./models/user');

const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        // Sincroniza todos os modelos com o banco de dados
        await sequelize.sync();
        console.log('Modelos sincronizados com o banco de dados.');
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
        process.exit(1);
    }
};

module.exports = syncDatabase;
