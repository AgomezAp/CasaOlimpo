"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearPDF = crearPDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function crearPDF(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margin: 50,
            });
            const fontPath = path_1.default.join(__dirname, '..', 'fonts', 'Helvetica.ttf');
            if (!fs_1.default.existsSync(fontPath)) {
                doc.font('Helvetica');
            }
            else {
                doc.font(fontPath);
            }
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.fontSize(20).text('FACTURA', { align: 'center' }).moveDown(0.5);
            const currentDate = new Date().toLocaleDateString('es-ES');
            doc.fontSize(10).text(`N°: ${data.factura.Fid}`, { continued: true }).text(`Fecha: ${currentDate}`, { align: 'right' }).moveDown();
            doc.fontSize(12).text('DATOS DEL PACIENTE', { underline: true }).moveDown(0.5);
            doc.fontSize(10).text(`${data.paciente.nombre} ${data.paciente.apellidos}`).text(`Documento: ${data.paciente.numero_documento}`);
            doc.fontSize(12).text(`Forma de pago: ${data.factura.tipo_pago}`).moveDown();
            // doc.fontSize(14).text('PRODUCTOS', { align: 'center'} ).moveDown();
            // doc.fontSize(10).text(`${data.producto.descripcion}: \t \t ${data.producto.precio}`) 
            doc.fontSize(16).text(`Total: $${data.factura.total.toFixed(2)}`, { align: 'right' }).moveDown();
            doc.fontSize(10).text('Gracias por preferirnos', { align: 'center' });
            doc.end();
        });
    });
}
