const sequelize = require('./src/config/database');

console.log('🔄 Sincronizando banco de dados...');

sequelize.sync({ force: true })
    .then(() => {
        console.log('✅ BD limpo e sincronizado com sucesso!');
        console.log('');
        console.log('Próximos passos:');
        console.log('1. npm start');
        console.log('2. Acesse http://localhost:3000');
        console.log('3. Crie uma nova conta ou faça login');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro ao sincronizar BD:', err.message);
        process.exit(1);
    });
