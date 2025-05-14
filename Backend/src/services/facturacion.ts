import path, { resolve } from 'path';
import fs from 'fs';
import { Factura } from '../models/facturacion';
import { Paciente } from '../models/paciente';
import {decryptData} from '../controllers/encriptado';
import PdfPrinter from 'pdfmake';
import { height, layout, margins, width } from 'pdfkit/js/page';
import { fillColor, lineWidth, text } from 'pdfkit';


export async function crearPDF(factura: Factura, paciente: Paciente): Promise<Buffer> {
   const fonts = {
      Helvetica: {
         normal: 'Helvetica',
         bold: 'Helvetica-Bold',
         italics: 'Helvetica-Oblique',
         bolditalics: 'Helvetica-BoldOblique'
      }
   };
   const Factura = new PdfPrinter(fonts);
   const logoPath = 'src/public/LogoDorado.png';
   const watermarkPath = 'src/public/SimboloGrisOscuro.png';
   const cliente = {
      nombre: "Juan Pérez",
      id: "123456789",
      direccion: "Calle 123 #45-67",
      telefono: "3001234567",
      correo: "juan@example.com",
      ciudad: "Bogotá"
   };
   const contenido = [
      {
         columns: [
            { image: logoPath, width: 150, absolutePosition: { x: ((595 - 150) / 2), y: 50 }}, // Assuming A4 page width in points (595.28)
            { image: watermarkPath, width: 300, opacity: 0.09, absolutePosition: { x: -80, y: -120}},
            { image: watermarkPath, width: 300, opacity: 0.09, absolutePosition: { x: 430, y: 600}},

         ],
      },
      { text: '', margin: [0, 60]},
      {text: 'DATOS DEL CLIENTE', style: 'header', margin: [0, 0, 0, 15]},
      {
         table: {
            widths: [200, '*'],
            body: [
               [
                  { text: `Nombre: ${decryptData(paciente.nombre)}`, style: 'tableCell', lineHeight: 1.2 },
                  { text: `Dirección: ${decryptData(paciente.direccion_domicilio)}`, style: 'tableCell', lineHeight: 1.2  }
               ],
               [
                  { text: `ID: ${paciente.numero_documento}`, style: 'tableCell', lineHeight: 1.2  },
                  { text: `Teléfono: ${decryptData(paciente.telefono)}`, style: 'tableCell', lineHeight: 1.2  }
               ],
               [
                  { text: `Correo: ${decryptData(paciente.email)}`, style: 'tableCell', lineHeight: 1.2  },
                  { text: `Ciudad: ${decryptData(paciente.ciudad_domicilio)}`, style: 'tableCell', lineHeight: 1.2  }
               ]
            ]
         },
         layout: 'noBorders', // Sin bordes para la tabla
         margin: [0, 0, 0, 2]
      },
      {
         canvas: [
            {
               type: 'line',
               x1: 0, y1: 7,
               x2: 520, y2: 7, // Ancho de página A4 (595.28 puntos)
               lineWidth: 2,
               lineColor: '#000000'
            }
         ],
         margin: [0, 20, 0, 10] // Margen: [left, top, right, bottom]
      },
      {
         table: {
            headerRows: 1,
            widths: [40, '*', 80, 80, 80], // Ajusta según necesites
            heights: 25,
            body: [
               [
                  { text: 'No.', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5]},
                  { text: 'Tratamiento', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5]},
                  { text: 'Precio', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5]},
                  { text: 'Cantidad', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5]},
                  { text: 'Total', style: 'tableHeader', alignment: 'center', margin: [0, 5, 0, 5]}
               ],
               [
                  { text: '1', style: 'tableCell', alignment: 'center', margin: [0, 5, 0, 5] },
                  { text: `${factura.procedimiento}`, style: 'tableCell', margin: [0, 5, 0, 5] },
                  { text: `${factura.total}`, style: 'tableCell', alignment: 'right', margin: [0, 5, 0, 5] },
                  { text: '1', style: 'tableCell', alignment: 'center', margin: [0, 5, 0, 5] },
                  { text: `${factura.total}`, style: 'tableCell', alignment: 'right', margin: [0, 5, 0, 5] }
               ],
               [
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell' },
                  { text: '', style: 'tableCell', alignment: 'right' },
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell', alignment: 'right' }
               ],
               [
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell' },
                  { text: '', style: 'tableCell', alignment: 'right' },
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell', alignment: 'right' }
               ],
               [
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell' },
                  { text: '', style: 'tableCell', alignment: 'right' },
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell', alignment: 'right' }
               ],
               [
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell' },
                  { text: '', style: 'tableCell', alignment: 'right' },
                  { text: '', style: 'tableCell', alignment: 'center' },
                  { text: '', style: 'tableCell', alignment: 'right' }
               ]
            ]
         },
         layout: {
            fillColor: (rowIndex: number) => {
               return rowIndex % 2 === 0 ? '#f5f5f5' : null;
            },
            hLineWidth: (i: number, node: any) => 1, 
            vLineWidth: (i: number, node: any) => 1,
            hLineColor: (i: number, node: any) => '#aaaaaa',
            vLineColor: (i: number, node: any) => '#aaaaaa'
         },
         margin: [ 0, 0, 0, 10]
      },
      {text: '', margin: [0, 5]},
      {
         table: {
            widths: ['*', 80, 80],
            heights: 25,
            body: [
               [
                  { text: 'Muchas gracias por tu compra', bold: true, fontSize: 16, alignment:'center', margin: [0, 5, 0, 5]},
                  { text: `TOTAL`, bold: true, fontSize: 14, alignment: 'left', margin: [0, 5, 0, 5]},
                  { text: `$${factura.total}`, bold: true, fontSize: 14, alignment: 'left', margin: [0, 5, 0, 5] }
               ]
            ]
         },
         layout: {
            fillColor: '#f5f5f5',
            hLineWidth: (i: number, node: any) => 1, 
            vLineWidth: (i: number, node: any) => 1,
            hLineColor: (i: number, node: any) => '#aaaaaa',
            vLineColor: (i: number, node: any) => '#aaaaaa'
         },
         margin: [0, 0, 0, 30]
      },
      {text: 'Detalles de la venta', style: 'header', margin: [0, 0, 0, 15]},
      {
         table: {
            widths: ['*'],
            body: [
               [
                  { text: `Vendedor: Alejandra Benavidez`, style: 'tableCell' }
               ],
               [
                  { text: `Total: ${factura.total}`, style: 'tableCell' }
               ],
               [
                  { text: `Tipo de Pago: ${factura.tipo_pago}`, style: 'tableCell' }
               ]
            ]
         },
         layout: 'noBorders', // Sin bordes para la tabla
         margin: [0, 0, 0, 15]
      },
      {
         columns: [
            {
               width: '*',
               stack: [
                  {
                     columns: [
                        {image: 'src/public/phone.png', width: 12, margin: [0, 0, 5, 0]},
                        {text: '+57 320 678 9628', margin: [0, 2, 0, 0]}
                     ],
                     margin: [0, 0, 0, 5]
                  },
                  {
                     columns: [
                        {image: 'src/public/web.png', width: 12, margin: [0, 0, 5, 0]},
                        {text: 'www.casaolimpo.com', margin: [0, 2, 0, 0]}
                     ],
                     margin: [0, 0, 0, 5]
                  },
                  {
                     columns: [
                        {image: 'src/public/correo.png', width: 12, margin: [0, 0, 5, 0]},
                        {text: 'casaolimpopr@gmail.com', margin: [0, 2, 0, 0]}
                     ],
                     margin: [0, 0, 0, 5]
                  },
                  {
                     columns: [
                        {image: 'src/public/ubicacion.png', width: 12, margin: [0, 0, 5, 0]},
                        {text: 'Cra 16 Bis #11-15, Pereira, Risaralda', margin: [0, 2, 0, 0]}
                     ],
                     margin: [0, 0, 0, 5]
                  },

               ],
               alignment: 'center'
            }
         ],
         margin: [40, 20, 40, 20], // Margen superior e inferior
         style: 'footer'
      }
   ];
   const estilos = {
      header:{
         fontSize: 20,
         bold: true,
         margin: [0, 10, 0, 15] as [number, number, number, number],
      },
      tableHeader: {
         bold: true,
         fontSize: 18,
         color: "black",
         fillColor: '#cccccb',
         alignment: "center"
      },
      tableCell: {
         color: 'black',
         fontSize: 15,
      },
      footer: {
         fontSize: 10,
         color: '#555555'
      }
   };

    const docDefinition = {
      pageSize: 'A4',
      content: contenido,
      styles: estilos,
      defaultStyle: {
         font: "Helvetica"
      }
    };

    const pdfDoc = Factura.createPdfKitDocument(docDefinition as any);

    return new Promise<Buffer>((resolve, reject) => {
        const chunks: any[] = [];
        pdfDoc.on("data",(chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
        pdfDoc.on("error", (err)=> reject(err));
        pdfDoc.end();
    });
};



// export const crearPDFkit = async (factura: Factura, paciente: Paciente): Promise<Buffer> => {
//     return new Promise((resolve, reject) => {
//         const doc = new PDFDocument({ margin: 50, size: 'A4' });
        
//         const buffers: Buffer[] = [];
//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', () => resolve(Buffer.concat(buffers)));
//         doc.on('error', reject);

//         const assetsPath = path.join(__dirname, '..','..','src', 'public');
//         console.log('assetsPath', assetsPath);
//         const logoPath = path.join(assetsPath, 'LogoDorado.png');
//         const watermarkPath = path.join(assetsPath, 'SimboloGrisOscuro.png');
//         const margin = doc.page.width - 100;
      
//         if (fs.existsSync(watermarkPath)) {
//          const watermarkWidth = 300;
//          doc.fillOpacity(0.09);
//          doc.image(watermarkPath, -80, -120, { width: watermarkWidth });
//          doc.image(watermarkPath, doc.page.width - watermarkWidth + 140, doc.page.height - watermarkWidth + 80 , {width: watermarkWidth});
//          doc.fillOpacity(1);

//         }

//         if (fs.existsSync(logoPath)) {
//          const logoWidth = 150;
//          const xcenter = (doc.page.width - logoWidth) / 2;
//             doc.image(logoPath, xcenter, 50, { width: logoWidth });
//             doc.moveDown(8);
//         } else {
//             doc.fontSize(20).text('CASA OLIMPO', { align: 'center' });
//             doc.moveDown(8);

//         }



//         // Datos quemados del producto (puedes modificarlos)
//         const producto = {
//             descripcion: 'Servicio médico', // Cambia esto según necesites
//             precio: factura.total,
//             cantidad: 1
//         };

//         const leftColumnX = 50; // Margen izquierdo
//         const rightColumnX = doc.page.width / 2 + 50; // Mitad de la página + margen
//         const columnWidth = doc.page.width / 2 - 70; // Ancho de cada columna
//         const lineHeight = 1.8; // Espaciado entre líneas
//         const titleBottomMargin = 15; // Margen inferior del título
//         let currentY = doc.y; // Posición Y actual

//         // Título de la sección
//         doc.fontSize(18).font('Helvetica-Bold').text('DATOS DEL CLIENTE', { align: 'left' }).moveDown(1.5);
//         currentY += lineHeight * doc.currentLineHeight();

//         // Resetear estilo
//         doc.fontSize(12).font('Helvetica');
//         // Primera fila: Nombre -> Dirección
//         doc.text(`Nombre: ${decryptData(paciente.nombre)} ${decryptData(paciente.apellidos) || ''}`, leftColumnX, currentY);
//         doc.text(`Dirección: ${decryptData(paciente.direccion_domicilio) || 'No especificado'}`, rightColumnX, currentY);
//         currentY += lineHeight * doc.currentLineHeight();
//         currentY += lineHeight * doc.currentLineHeight();
//         // Segunda fila: ID -> Teléfono
//         doc.text(`ID: ${paciente.numero_documento}`, leftColumnX, currentY);
//         doc.text(`Teléfono: ${decryptData(paciente.telefono) || 'No especificado'}`, rightColumnX, currentY);
//         currentY += lineHeight * doc.currentLineHeight();


//         // Tercera fila: Correo -> Ciudad
//         doc.text(`Correo: ${decryptData(paciente.email) || 'No especificado'}`, leftColumnX, currentY);
//         doc.text(`Ciudad: ${decryptData(paciente.ciudad_nacimiento) || 'No especificado'}`, rightColumnX, currentY);
//         currentY += lineHeight * doc.currentLineHeight();
//         currentY += lineHeight * doc.currentLineHeight();

//         // Ajustar posición Y para el siguiente elemento
//         doc.y = currentY;

//         doc.moveTo(40, doc.y)
//            .lineTo(530, doc.y)
//            .stroke();
//         currentY += lineHeight * doc.currentLineHeight();
//         currentY += lineHeight * doc.currentLineHeight();


//          doc.end()
//     });
// };

