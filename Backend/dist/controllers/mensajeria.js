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
exports.programarEnvio = exports.obtenerFecha = exports.enviarMensaje = void 0;
const paciente_1 = require("../models/paciente");
const sequelize_1 = require("sequelize");
const node_schedule_1 = __importDefault(require("node-schedule"));
const enviarMensaje = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumberCliente, phoneNumberMaestro, nombreDelCliente, message } = req.body;
        // Validar que todos los campos requeridos estén presentes
        if (!phoneNumberCliente || !phoneNumberMaestro || !nombreDelCliente || !message) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }
        // Llamar a la API externa para enviar el mensaje
        const apiResponse = yield fetch('https://gestor-de-mesajeria-via-whatsapp-g5hc.onrender.com/api/messages/CrearMensaje', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': `181.129.218.198`
            },
            body: JSON.stringify({
                sessionId: "1234",
                phoneNumberCliente: phoneNumberCliente,
                phoneNumberMaestro: phoneNumberMaestro,
                nombreDelCliente: nombreDelCliente,
                message: message
            })
        });
        // Verificar la respuesta de la API
        if (!apiResponse.ok) {
            const errorResponse = yield apiResponse.json();
            return res.status(apiResponse.status).json({ error: errorResponse.message || 'Error al enviar el mensaje.' });
        }
        const apiResult = yield apiResponse.json();
        // Simulación de envío de mensaje a través de una API externa
        const mensajeEnviado = {
            sessionId: "1234",
            to: phoneNumberMaestro,
            from: phoneNumberCliente,
            nombreDelCliente,
            message,
            status: 'Mensaje enviado exitosamente',
        };
        // Responder con el resultado del envío
        return res.status(200).json(mensajeEnviado);
    }
    catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.enviarMensaje = enviarMensaje;
const obtenerFecha = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fechaActual = new Date();
        const diaSemana = fechaActual.toLocaleString('es-ES', { weekday: 'long' });
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const dia = (fechaActual.getDate().toString().padStart(2, '0'));
        const clienteConMismaFecha = yield paciente_1.Paciente.findOne({
            where: {
                fecha_nacimiento: {
                    [sequelize_1.Op.like]: `%${mes}-${dia}%`
                }
            }
        });
        if (clienteConMismaFecha) {
            return res.status(200).json({ dia: diaSemana, cliente: clienteConMismaFecha });
        }
        return res.status(200).json({ dia: diaSemana });
    }
    catch (error) {
        console.error('Error al obtener la fecha:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.obtenerFecha = obtenerFecha;
const programarEnvio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Programar una tarea diaria a las 8:00 AM
        node_schedule_1.default.scheduleJob('0 8 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const fechaActual = new Date();
                const diaSemana = fechaActual.toLocaleString('es-ES', { weekday: 'long' });
                const clienteConMismaFecha = yield paciente_1.Paciente.findOne({
                    where: {
                        fecha_nacimiento: {
                            [sequelize_1.Op.like]: `%${fechaActual.getMonth() + 1}-${fechaActual.getDate()}%`
                        }
                    }
                });
                if (clienteConMismaFecha) {
                    console.log(`Hoy es ${diaSemana}. Cliente con misma fecha: ${clienteConMismaFecha.nombre}`);
                    // Aquí puedes agregar lógica para enviar un mensaje o realizar otra acción
                }
                else {
                    console.log(`Hoy es ${diaSemana}. No hay clientes con esta fecha.`);
                }
            }
            catch (error) {
                console.error('Error al ejecutar la tarea programada:', error);
            }
        }));
        return res.status(200).json({ message: 'Tarea programada exitosamente.' });
    }
    catch (error) {
        console.error('Error al programar la tarea:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.programarEnvio = programarEnvio;
