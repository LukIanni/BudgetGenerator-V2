// Migration: Adicionar campos de valores reais às tabelas
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
    try {
        console.log('🔄 Iniciando migração...');

        // Adicionar campos à tabela PRODUTO
        await sequelize.query(`
            ALTER TABLE produto
            ADD COLUMN IF NOT EXISTS custo_total DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✅ Campo custo_total adicionado a produto');

        await sequelize.query(`
            ALTER TABLE produto
            ADD COLUMN IF NOT EXISTS lucro_total DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✅ Campo lucro_total adicionado a produto');

        await sequelize.query(`
            ALTER TABLE produto
            ADD COLUMN IF NOT EXISTS valor_final DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✅ Campo valor_final adicionado a produto');

        // Adicionar campos à tabela SERVICO
        await sequelize.query(`
            ALTER TABLE servico
            ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✅ Campo valor_total adicionado a servico');

        await sequelize.query(`
            ALTER TABLE servico
            ADD COLUMN IF NOT EXISTS lucro_em_reais DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✅ Campo lucro_em_reais adicionado a servico');

        console.log('✅ Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
        process.exit(1);
    }
}

migrate();
