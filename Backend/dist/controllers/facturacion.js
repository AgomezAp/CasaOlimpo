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
exports.verFacturas = exports.reimprimir = exports.crearFactura = void 0;
const paciente_1 = require("../models/paciente");
const facturacion_1 = require("../models/facturacion");
const facturacion_2 = require("../services/facturacion");
const crearFactura = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento, tipo_pago, total } = req.body;
        if (!numero_documento || !tipo_pago || !total) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        const paciente = yield paciente_1.Paciente.findAll({
            where: {
                numero_documento: numero_documento,
            },
        });
        if (paciente.length === 0) {
            return res.status(404).json({ message: "El paciente no existe", });
        }
        const nuevaFactura = yield facturacion_1.Factura.create({
            numero_documento,
            tipo_pago,
            total
        });
        (0, facturacion_2.crearPDF)(nuevaFactura);
        return res.status(200).json(nuevaFactura);
    }
    catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.crearFactura = crearFactura;
const reimprimir = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Fid } = req.body;
        const factura = yield facturacion_1.Factura.findOne({ where: { Fid } });
        if (factura === null) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }
        (0, facturacion_2.crearPDF)(factura);
        return res.status(200).json(factura);
    }
    catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.reimprimir = reimprimir;
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
