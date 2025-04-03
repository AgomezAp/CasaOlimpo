"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearPDF = crearPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
function crearPDF(body) {
    const doc = new pdfkit_1.default();
    const outputPath = `factura-${body.numero_documento}.pdf`;
    const writeStream = fs_1.default.createWriteStream(outputPath);
    doc.pipe(writeStream);
    doc.fontSize(12).text(JSON.stringify(body, null, 2), {
        align: 'left',
    });
    doc.end();
    writeStream.on('finish', () => {
        console.log(`PDF generado correctamente en ${outputPath}`);
    });
}
