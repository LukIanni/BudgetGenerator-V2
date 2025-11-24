const sequelize = require('./src/config/database');
const User = require('./src/models/user');
const Produto = require('./src/models/produto');
const Servico = require('./src/models/servico');

async function resetDatabase() {
    try {
        console.log('🔄 Sincronizando banco de dados com force: true...');
        
        // Define as relações (importante!)
        User.hasMany(Produto, { foreignKey: 'id_usuario' });
        User.hasMany(Servico, { foreignKey: 'id_usuario' });
        Produto.belongsTo(User, { foreignKey: 'id_usuario' });
        Servico.belongsTo(User, { foreignKey: 'id_usuario' });
        
        // Sincroniza com force: true e alter: true para recriar TODAS as tabelas com os campos corretos
        await sequelize.sync({ force: true, alter: true });
        
        console.log('✅ BD limpo e sincronizado com sucesso!');
        console.log('✅ Todas as colunas foram criadas corretamente!');
        console.log('');
        console.log('📝 Próximos passos:');
        console.log('1. npm start');
        console.log('2. Acesse http://localhost:3000');
        console.log('3. Crie uma nova conta ou faça login');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Erro ao sincronizar BD:', err.message);
        console.error('\nDetalhes completos:');
        console.error(err);
        process.exit(1);
    }
}

resetDatabase();
