const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateBudgetPdf(orcamentoData, iaResponse) {
    // Cria pasta assets se não existir
    const assetsDir = path.join(__dirname, '../assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir);
    }

    // Caminho do arquivo PDF
    const fileName = `${Date.now()}_orcamento.pdf`;
    const pdfPath = path.join(assetsDir, fileName);

    // Criar documento PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    // Conteúdo do PDF
    doc.fontSize(18).text('Orçamento Gerado', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Detalhes: ${orcamentoData.nomeProduto || orcamentoData.nomeServico}`);
    doc.moveDown();
    doc.fontSize(12).text(`Resposta da IA:\n${iaResponse}`);
    doc.moveDown();
    doc.text('Este documento foi gerado automaticamente pelo sistema.');

    doc.end();

    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(pdfPath)); // Retorna caminho completo do PDF
        writeStream.on('error', reject);
    });
}

module.exports = { generateBudgetPdf };
