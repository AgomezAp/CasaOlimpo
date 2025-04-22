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
exports.editarDescuento = exports.eliminarDescuento = exports.obtenerDescuentos = exports.crearDescuento = exports.enviarDescuento = void 0;
const paciente_1 = require("../models/paciente");
const descuento_1 = require("../models/descuento");
const enviarDescuento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { mensaje } = req.body;
        const numeros = yield paciente_1.Paciente.findAll({
            attributes: ['nombre', 'apellidos', 'celular']
        });
        for (const num of numeros) {
            const newBody = JSON.stringify({
                sessionId: "1234",
                phoneNumberCliente: '',
                phoneNumberMaestro: `57${num.celular}`, //numero que va a recibir el mensaje
                nombreDelCliente: `${num.nombre} ${num.apellidos}`,
                message: `${num.nombre}`
            });
            const message = yield fetch('https://gestor-de-mesajeria-via-whatsapp-g5hc.onrender.com/api/message/CrearMensaje', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: newBody
            });
        }
    }
    catch (error) {
    }
});
exports.enviarDescuento = enviarDescuento;
const crearDescuento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("aca");
    try {
        const { motivo_descuento, fecha_inicio, fecha_fin, porcentaje } = req.body;
        console.log('vamos');
        if (!motivo_descuento || !fecha_inicio || !fecha_fin || !porcentaje) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }
        const nuevoDescuento = yield descuento_1.Descuento.create({
            motivo_descuento,
            fecha_inicio,
            fecha_fin,
            porcentaje
        });
        return res.status(201).json({ message: 'Descuento creado exitosamente', descuento: nuevoDescuento });
    }
    catch (error) {
        console.error('Error al crear Descuento', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
});
exports.crearDescuento = crearDescuento;
const obtenerDescuentos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const descuentos = yield descuento_1.Descuento.findAll();
        return res.status(200).json({ descuentos: descuentos });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al obtener los descuentos', error });
    }
});
exports.obtenerDescuentos = obtenerDescuentos;
const eliminarDescuento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'El ID del descuento es obligatorio' });
        }
        const descuento = yield descuento_1.Descuento.findByPk(id);
        if (!descuento) {
            return res.status(404).json({ message: 'Descuento no encontrado' });
        }
        yield descuento.destroy();
        return res.status(200).json({ message: 'Descuento eliminado exitosamente' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el descuento', error });
    }
});
exports.eliminarDescuento = eliminarDescuento;
const editarDescuento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (!id) {
            return res.status(400).json({ message: 'El ID del descuento es obligatorio' });
        }
        const descuento = yield descuento_1.Descuento.findByPk(id);
        if (!descuento) {
            return res.status(404).json({ message: 'Descuento no encontrado' });
        }
        yield descuento.update(updateData);
        return res.status(200).json({ message: 'Descuento actualizado exitosamente', descuento });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el descuento', error });
    }
});
exports.editarDescuento = editarDescuento;
