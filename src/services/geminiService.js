const { GoogleGenerativeAI } = require("@google/generative-ai");
const e = require("cors");

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
            console.log('🤖 [GEMINI] Iniciando geração de orçamento...');
            console.log('🤖 [GEMINI] Dados recebidos:', JSON.stringify(data, null, 2));

            let prompt = "";

            if (data.nomeProduto) {
                prompt = `Gere uma resposta formal e profissional para um orçamento de produto.
Retorne apenas texto puro (plain text). NÃO use Markdown, elementos de formatação (por exemplo: **negrito**, _itálico_), listas com marcadores, nem caracteres asterisco (*) no conteúdo.
Estruture a resposta em seções claras separadas por linhas em branco usando títulos em maiúsculas (por exemplo: TITULO, DESCRIÇÃO, ESPECIFICAÇÕES, CÁLCULO DO ORÇAMENTO, VALOR TOTAL, CONDIÇÕES GERAIS, OBSERVAÇÕES, CONTATO).
Formate valores monetários em reais (ex.: R$ 1.234,56) e inclua os cálculos passo a passo quando aplicável.

Use os dados abaixo para preencher o orçamento:
Nome do Produto: ${data.nomeProduto}
Custo do Produto: R$ ${data.custoProducao}
Materiais: ${data.materiaisUtilizados}
Margem de Lucro: ${data.margemLucro}%
Horas: ${data.horas}h
Valor da Hora: R$ ${data.valorHora}
Custo Extra: R$ ${data.custoExtra || 0}

OBRIGATÓRIO: Ao final do orçamento, inclua EXATAMENTE estas linhas (sem modificações):
CUSTO TOTAL: R$ [calcule: (horas × valor_hora) + custo_extra]
LUCRO TOTAL: R$ [calcule: custo_total × (margem_lucro / 100)]
VALOR FINAL: R$ [calcule: custo_total + lucro_total]
`;
            } else if (data.nomeServico) {
                prompt = `Gere uma resposta formal e profissional para um orçamento de serviço.
Retorne apenas texto puro (plain text). NÃO use Markdown, elementos de formatação (por exemplo: **negrito**, _itálico_), listas com marcadores, nem caracteres asterisco (*) no conteúdo.
Estruture a resposta em seções claras separadas por linhas em branco usando títulos em maiúsculas (por exemplo: TITULO, DESCRIÇÃO, ESPECIFICAÇÕES, CÁLCULO DO ORÇAMENTO, VALOR TOTAL, CONDIÇÕES GERAIS, OBSERVAÇÕES, CONTATO).
Formate valores monetários em reais (ex.: R$ 1.234,56) e inclua os cálculos passo a passo quando aplicável.

Use os dados abaixo para preencher o orçamento de serviço:
Nome do Serviço: ${data.nomeServico}
Valor Base: R$ ${data.valorBase}
Horas Estimadas: ${data.horasEstimadas}h
Materiais: ${data.materiaisServico}
Custo do Serviço: R$ ${data.custoServico}
Margem de Lucro: ${data.lucroServico}%
Descrição: ${data.descricaoServico || 'Não fornecida'}

OBRIGATÓRIO: Ao final do orçamento, inclua EXATAMENTE estas linhas (sem modificações):
CUSTO DO SERVIÇO: R$ ${data.custoServico}
LUCRO EM REAIS: R$ [calcule: ${data.custoServico} × (${data.lucroServico} / 100)]
VALOR TOTAL DO SERVIÇO: R$ [calcule: custo + lucro]
`;
            }

            console.log('🤖 [GEMINI] Prompt preparado, enviando para API...');
            console.log('🤖 [GEMINI] Model:', this.model.model);
            console.log('🤖 [GEMINI] API Key presente:', !!process.env.GEMINI_API_KEY);

            const result = await this.model.generateContent({
                contents: [{ parts: [{ text: prompt }] }]
            });

            console.log('🤖 [GEMINI] Resposta recebida da API');
            const response = await result.response;
            const texto = response.text();

            console.log('✅ [GEMINI] Resposta gerada com sucesso (', texto.length, 'caracteres )');
            return texto;
        } catch (error) {
            console.error('❌ [GEMINI] ERRO ao gerar resposta:', error);
            console.error('❌ [GEMINI] Mensagem:', error.message);
            console.error('❌ [GEMINI] Stack:', error.stack);
            throw new Error(`Erro ao gerar orçamento com Gemini: ${error.message}`);
        }
    }
}

module.exports = new GeminiService();
