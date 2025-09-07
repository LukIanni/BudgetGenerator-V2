const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        });
    }

    async generateBudgetResponse(data) {
        try {
            let prompt = "";

            if (data.nomeProduto) {
                prompt = `
                Gere uma resposta profissional para um orçamento de produto:
                - Nome do Produto: ${data.nomeProduto}
                - Custo: R$ ${data.custoProducao}
                - Materiais: ${data.materiaisUtilizados}
                - Margem de Lucro: ${data.margemLucro}%
                - Horas: ${data.horas}h
                - Valor Hora: R$ ${data.valorHora}
                - Custo Extra: R$ ${data.custoExtra || 0}
                `;
            } else {
                prompt = `
                Gere uma resposta profissional para um orçamento de serviço:
                - Nome do Serviço: ${data.nomeServico}
                - Valor Base: R$ ${data.valorBase}
                - Horas: ${data.horasEstimadas}h
                - Materiais: ${data.materiaisServico}
                - Custo: R$ ${data.custoServico}
                - Lucro: ${data.lucroServico}%
                - Descrição: ${data.descricaoServico || 'Não fornecida'}
                `;
            }

            const result = await this.model.generateContent({
                contents: [{ parts: [{ text: prompt }] }]
            });

            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Erro ao gerar resposta com Gemini:', error);
            throw error;
        }
    }
}

module.exports = new GeminiService();
