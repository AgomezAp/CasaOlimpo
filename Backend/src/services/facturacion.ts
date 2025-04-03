import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Factura } from '../models/facturacion';

export function crearPDF(body: Factura){
    const doc = new PDFDocument();

    const outputPath = `factura-${body.numero_documento}.pdf`

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);
    doc.fontSize(12).text(JSON.stringify(body, null, 2), {
        align: 'left',
    });
    doc.end()

    writeStream.on('finish', () => {
        console.log(`PDF generado correctamente en ${outputPath}`);
    });

}