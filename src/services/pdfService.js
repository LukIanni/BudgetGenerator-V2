const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateBudgetPdf(orcamentoData, iaResponse) {
    // Cria pasta uploads se não existir
    const uploadsDir = path.join(__dirname, '../public/uploads/pdfs');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Caminho do arquivo PDF
    const fileName = `orcamento_${Date.now()}.pdf`;
    const pdfPath = path.join(uploadsDir, fileName);

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
