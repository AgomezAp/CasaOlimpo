import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { Factura } from '../models/facturacion';
import { Paciente } from '../models/paciente';
import { width } from 'pdfkit/js/page';

// export async function crearPDF(data: {factura: Factura, paciente: Paciente, producto: {descripcion: string; precio: number;}}): Promise<Buffer> {
//     return new Promise((resolve, reject) => {
//         const doc = new PDFDocument({
//             size: 'A4',
//             margin: 50,
//         });
//         const fontPath = path.join(__dirname,'..', 'fonts', 'Helvetica.ttf')
//         if (!fs.existsSync(fontPath)) {
//             doc.font('Helvetica')
//         } else {
//             doc.font(fontPath)
//         }
//         const buffers: Uint8Array[] = [];
//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', () => resolve(Buffer.concat(buffers)));

//         doc.fontSize(20).text('FACTURA', { align: 'center'}).moveDown(0.5)

//         const currentDate = new Date().toLocaleDateString('es-ES');
//         doc.fontSize(10).text(`N°: ${data.factura.Fid}`, { continued: true }).text(`Fecha: ${currentDate}`, { align: 'right' }).moveDown();

//         doc.fontSize(12).text('DATOS DEL PACIENTE', { underline: true}).moveDown(0.5);

//         doc.fontSize(10).text(`${data.paciente.nombre} ${data.paciente.apellidos}`).text(`Documento: ${data.paciente.numero_documento}`);

//         doc.fontSize(12).text(`Forma de pago: ${data.factura.tipo_pago}`).moveDown();

//         // doc.fontSize(14).text('PRODUCTOS', { align: 'center'} ).moveDown();

//         // doc.fontSize(10).text(`${data.producto.descripcion}: \t \t ${data.producto.precio}`) 
        
//         doc.fontSize(16).text(`Total: $${data.factura.total.toFixed(2)}`, {align: 'right'}).moveDown();

//         doc.fontSize(10).text('Gracias por preferirnos', { align: 'center'});

//         doc.end();        
//     });
    
// }

export const crearPDF = async (factura: Factura, paciente: Paciente): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const assetsPath = path.join(__dirname, '..','..','src', 'public');
        console.log('assetsPath', assetsPath);
        const logoPath = path.join(assetsPath, 'LogoDorado.png');
        const watermarkPath = path.join(assetsPath, 'SimboloGrisOscuro.png');

        if (fs.existsSync(watermarkPath)) {
         const watermarkWidth = 300;
         doc.fillOpacity(0.3);
         doc.image(watermarkPath, -80, -90, { width: watermarkWidth });
         doc.image(watermarkPath, doc.page.width - watermarkWidth + 140, doc.page.height - watermarkWidth + 80 , {width: watermarkWidth});
         doc.fillOpacity(1);

        }

        if (fs.existsSync(logoPath)) {
         const logoWidth = 150;
         const xcenter = (doc.page.width - logoWidth) / 2;
            doc.image(logoPath, xcenter, 100, { width: logoWidth });
            doc.moveDown(4);
        } else {
            doc.fontSize(20).text('CASA OLIMPO', { align: 'center' });
        }



        // Datos quemados del producto (puedes modificarlos)
        const producto = {
            descripcion: 'Servicio médico', // Cambia esto según necesites
            precio: factura.total,
            cantidad: 1
        };

        // Encabezado
        /*doc.fontSize(20)
           .text('CASA OLIMPO', { align: 'center' })
           .moveDown(0.5)
           .fontSize(12)
           .text('Cra 16 Bis #11-15, Pereira, Risaralda', { align: 'center' })
           .text('+57 320 678 9628 | casaolimpopr@gmail.com | www.casaolimpo.com', { align: 'center' })
           .moveDown(1)
           .fontSize(16)
           .text(`FACTURA #${factura.Fid}`, { align: 'center' })
           .moveDown(1);*/

        // Línea divisoria
        /*doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();*/

        // Datos del cliente (desde el modelo Paciente)
        doc.fontSize(12)
           .text('DATOS DEL CLIENTE')
           .moveDown(0.5)
           .text(`Nombre: ${paciente.nombre}${paciente.apellidos || ''}`)
           .text(`ID: ${paciente.numero_documento}`)
           .text(`Correo: ${paciente.email || 'No especificado'}`)
           .text(`Ciudad: ${paciente.ciudad_nacimiento || 'No especificado'}`)
           .moveDown(0.5)
           .text(`Dirección: ${paciente.direccion_domicilio || 'No especificado'}`)
           .text(`Teléfono: ${paciente.telefono || 'No especificado'}`)
           .moveDown(1);

        // Tabla de productos
        const tableTop = doc.y;
        
        // Encabezados de tabla
        doc.font('Helvetica-Bold')
           .text('No.', 50, tableTop)
           .text('Descripción', 120, tableTop)
           .text('Precio', 350, tableTop, { width: 80, align: 'right' })
           .text('Cantidad', 430, tableTop, { width: 80, align: 'right' })
           .text('Total', 510, tableTop, { width: 80, align: 'right' })
           .font('Helvetica');

        // Datos del producto (quemados)
        const y = tableTop + 20;
        doc.text('1', 50, y)
           .text(producto.descripcion, 120, y)
           .text(`$${producto.precio.toFixed(2)}`, 350, y, { width: 80, align: 'right' })
           .text(producto.cantidad.toString(), 430, y, { width: 80, align: 'right' })
           .text(`$${producto.precio.toFixed(2)}`, 510, y, { width: 80, align: 'right' });

        // Total
        doc.moveDown(2)
           .font('Helvetica-Bold')
           .text(`TOTAL: $${factura.total.toFixed(2)}`, { align: 'right' })
           .moveDown(2);

        // Detalles de la venta
        const currentDate = new Date().toLocaleDateString('es-ES');
        doc.fontSize(12)
           .text('DETALLES DE LA VENTA', { underline: true })
           .moveDown(0.5)
           .text(`Vendedor: Sistema Automático`)
           .text(`Tipo de pago: ${factura.tipo_pago}`)
           .text(`Fecha: ${currentDate}`)
           .moveDown(1)
           .font('Helvetica-Bold')
           .text(`Total a pagar: $${factura.total.toFixed(2)}`)
           .moveDown(2);

        // Pie de página
        doc.fontSize(10)
           .text('Muchas gracias por su preferencia', { align: 'center' })
           .moveDown(0.5)
           .text('+57 320 678 9628 | www.casaolimpo.com | casaolimpopr@gmail.com', { align: 'center' })
           .text('Cra 16 Bis #11-15, Pereira, Risaralda', { align: 'center' });

        doc.end();
    });
};