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
            
            if (data.nomeProduto) { // Se for um produto
                prompt = `
                Gere uma resposta profissional para um orçamento de produto com as seguintes informações:
                - Nome do Produto: ${data.nomeProduto}
                - Custo de Produção: R$ ${data.custoProducao}
                - Materiais Utilizados: ${data.materiaisUtilizados}
                - Margem de Lucro: ${data.margemLucro}%
                - Horas Estimadas: ${data.horas}h
                - Valor Hora: R$ ${data.valorHora}
                - Custo Extra: R$ ${data.custoExtra || 0}

                Por favor, gere uma resposta profissional que:
                1. Agradeça o interesse
                2. Detalhe os materiais e processo
                3. Explique o prazo de produção
                4. Mencione a qualidade do produto
                5. Deixe claro que o valor inclui todos os materiais e mão de obra
                6. Seja claro, conciso e breve
                7. Use uma linguagem acessível, evitando termos técnicos complexos
                `;
            } else { // Se for um serviço
                prompt = `
                Gere uma resposta profissional para um orçamento de serviço com as seguintes informações:
                - Nome do Serviço: ${data.nomeServico}
                - Valor Base: R$ ${data.valorBase}
                - Horas Estimadas: ${data.horasEstimadas}h
                - Materiais Utilizados: ${data.materiaisServico}
                - Custo: R$ ${data.custoServico}
                - Lucro: ${data.lucroServico}%
                - Descrição: ${data.descricaoServico || 'Não fornecida'}

                Por favor, gere uma resposta profissional que:
                1. Agradeça o interesse
                2. Detalhe os materiais incluídos
                3. Mencione o prazo de execução
                4. Seja claro, conciso e breve
                5. Use uma linguagem acessível, evitando termos técnicos complexos
                `;
            }

            const result = await this.model.generateContent({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
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
