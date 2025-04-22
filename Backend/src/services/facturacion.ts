import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { Factura } from '../models/facturacion';
import { Paciente } from '../models/paciente';

export async function crearPDF(data: {factura: Factura, paciente: Paciente, producto: {descripcion: string; precio: number;}}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
        });
        const fontPath = path.join(__dirname,'..', 'fonts', 'Helvetica.ttf')
        if (!fs.existsSync(fontPath)) {
            doc.font('Helvetica')
        } else {
            doc.font(fontPath)
        }
        const buffers: Uint8Array[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        doc.fontSize(20).text('FACTURA', { align: 'center'}).moveDown(0.5)

        const currentDate = new Date().toLocaleDateString('es-ES');
        doc.fontSize(10).text(`N°: ${data.factura.Fid}`, { continued: true }).text(`Fecha: ${currentDate}`, { align: 'right' }).moveDown();

        doc.fontSize(12).text('DATOS DEL PACIENTE', { underline: true}).moveDown(0.5);

        doc.fontSize(10).text(`${data.paciente.nombre} ${data.paciente.apellidos}`).text(`Documento: ${data.paciente.numero_documento}`);

        doc.fontSize(12).text(`Forma de pago: ${data.factura.tipo_pago}`).moveDown();

        // doc.fontSize(14).text('PRODUCTOS', { align: 'center'} ).moveDown();

        // doc.fontSize(10).text(`${data.producto.descripcion}: \t \t ${data.producto.precio}`) 
        
        doc.fontSize(16).text(`Total: $${data.factura.total.toFixed(2)}`, {align: 'right'}).moveDown();

        doc.fontSize(10).text('Gracias por preferirnos', { align: 'center'});

        doc.end();        
    });
    
}