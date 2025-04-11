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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verFacturas = exports.crearFactura = void 0;
const paciente_1 = require("../models/paciente");
const facturacion_1 = require("../models/facturacion");
const facturacion_2 = require("../services/facturacion");
const crearFactura = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento, tipo_pago, total, producto } = req.body;
        if (!numero_documento || !tipo_pago || !total || !producto) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }
        const paciente = yield paciente_1.Paciente.findOne({
            where: { numero_documento },
        });
        if (!paciente) {
            return res.status(404).json({ succes: false, message: "El paciente no existe", });
        }
        const nuevaFactura = yield facturacion_1.Factura.create({
            numero_documento,
            tipo_pago,
            total
        });
        const pdfBuffer = yield (0, facturacion_2.crearPDF)({
            factura: nuevaFactura,
            paciente: paciente,
            producto: producto
        });
        res.setHeader('Content-type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura${nuevaFactura.Fid}.pdf`);
        return res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error al crear la factura:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.crearFactura = crearFactura;
// export const reimprimir = async (req: Request, res: Response): Promise<any> => {
//     try {
//         const { Fid } = req.body;
//         const factura = await Factura.findOne({ where: { Fid } })
//         if(factura === null){
//             return res.status(404).json({message: 'Factura no encontrada'})
//         }
//         crearPDF(factura);
//         return res.status(200).json(factura);
//     } catch (error) {
//         console.error('Error al crear la consulta:', error);
//         return res.status(500).json({ error: 'Error interno del servidor.' });
//     }
// }
const verFacturas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const facturas = yield facturacion_1.Factura.findAll();
        if (facturas === null) {
            return res.status(404).json({ message: 'Ninguna factura encontrada' });
        }
        return res.status(200).json(facturas);
    }
    catch (error) {
        console.error('Error al obtener las facturas:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});
exports.verFacturas = verFacturas;
