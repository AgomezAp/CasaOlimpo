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
exports.mensajeToFront = exports.obtenerMensaje = exports.mensajeGuardado = exports.funObtenerFecha = exports.obtenerFecha = exports.funEnviarMensaje = exports.enviarMensaje = void 0;
const paciente_1 = require("../models/paciente");
const sequelize_1 = require("sequelize");
const enviarMensaje = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumberCliente, phoneNumberMaestro, nombreDelCliente, message } = req.body;
        // Validar que todos los campos requeridos estén presentes
        if (!phoneNumberCliente || !phoneNumberMaestro || !nombreDelCliente || !message) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }
        const mensajeEnviado = yield (0, exports.funEnviarMensaje)(phoneNumberCliente, phoneNumberMaestro, nombreDelCliente, message);
        return res.status(200).json(mensajeEnviado);
    }
    catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.enviarMensaje = enviarMensaje;
const funEnviarMensaje = (phoneNumberCliente, phoneNumberMaestro, nombreDelCliente, message) => __awaiter(void 0, void 0, void 0, function* () {
    const apiResponse = yield fetch(`${process.env.SERVER_MENSAJERIA}/api/messages/CrearMensaje`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': '181.129.218.198'
        },
        body: JSON.stringify({
            sessionID: "1234",
            phoneNumberCliente,
            phoneNumberMaestro,
            nombreDelCliente,
            message
        })
    });
    if (!apiResponse.ok) {
        const errorResponse = yield apiResponse.text();
        throw new Error('Error al enviar el mensaje.');
    }
    const apiResult = yield apiResponse.json();
    const mensajeEnviado = {
        sessionID: "1234",
        to: phoneNumberCliente,
        from: phoneNumberMaestro,
        nombreDelCliente,
        message,
        status: 'Mensaje enviado correctamente'
    };
    return apiResult;
});
exports.funEnviarMensaje = funEnviarMensaje;
const obtenerFecha = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pacientes = yield (0, exports.funObtenerFecha)();
        if (pacientes.length > 0) {
            return res.status(200).json({ pacientes: pacientes });
        }
        return res.status(200).json({ message: 'No hay pacientes cumpliendo años hoy.' });
    }
    catch (error) {
        console.error('Error al obtener la fecha:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.obtenerFecha = obtenerFecha;
const funObtenerFecha = () => __awaiter(void 0, void 0, void 0, function* () {
    const fechaActual = new Date();
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const dia = (fechaActual.getDate().toString().padStart(2, '0'));
    const clienteConMismaFecha = yield paciente_1.Paciente.findAll({
        where: sequelize_1.Sequelize.where(sequelize_1.Sequelize.fn('TO_CHAR', sequelize_1.Sequelize.col('fecha_nacimiento'), 'MM-DD'), `${mes}-${dia}`)
    });
    return clienteConMismaFecha;
});
exports.funObtenerFecha = funObtenerFecha;
const obtenerMensaje = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recibir cambio de mensaje
    try {
        const { mensaje, hora } = req.body;
        exports.mensajeGuardado = { mensaje, hora };
        console.log(exports.mensajeGuardado);
        return res.status(200).json({ mensaje });
    }
    catch (error) {
        console.error('Error al programar la tarea:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.obtenerMensaje = obtenerMensaje;
const mensajeToFront = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    //mostrar mensaje en el front
    if (!exports.mensajeGuardado || (((_a = exports.mensajeGuardado.mensaje) === null || _a === void 0 ? void 0 : _a.trim()) === '' && ((_b = exports.mensajeGuardado.hora) === null || _b === void 0 ? void 0 : _b.trim()) === '')) {
        exports.mensajeGuardado = {
            mensaje: '¡Feliz cumpleaños! En Casa Olimpo, celebramos contigo este día especial. Que la luz de tu sonrisa brille aún más fuerte y que cada deseo de tu corazón se haga realidad. ¡Te enviamos un abrazo lleno de energía positiva!',
            hora: "10:00"
        };
    }
    console.log(exports.mensajeGuardado);
    return res.status(200).json(exports.mensajeGuardado);
});
exports.mensajeToFront = mensajeToFront;
