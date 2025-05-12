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
exports.mensajeToFront = exports.funObtenerMensaje = exports.obtenerMensaje = exports.mensajeGuardado = exports.funObtenerFecha = exports.obtenerFecha = exports.eliminarSesion = exports.funNuevaSesion = exports.nuevaSesion = exports.funVerificarSesion = exports.verificarSesion = exports.funEnviarMensaje = exports.enviarMensaje = exports.serverwsocket = void 0;
const paciente_1 = require("../models/paciente");
const sequelize_1 = require("sequelize");
const qrcode_1 = __importDefault(require("qrcode"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
let currentQr = null;
const serverwsocket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const checkUpdates = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const newQr = yield (0, exports.funNuevaSesion)('1234');
            const qrDataURL = yield qrcode_1.default.toDataURL(newQr);
            const qrCodeString = yield qrcode_1.default.toString(qrDataURL, { type: 'terminal', small: true });
            if (qrDataURL !== currentQr) {
                currentQr = qrDataURL;
                io.emit('qr-update', qrCodeString);
            }
        }
        catch (error) {
            console.error('Error al actualizar QR16165', error);
        }
    });
    setInterval(() => checkUpdates(), 5000);
    io.on('connection', (socket) => {
        console.log('Cliente conectado');
        if (currentQr) {
            socket.emit('qr-update', currentQr);
        }
    });
    server.listen(3001, () => {
        console.log('Websocket server en puerto 3001');
        checkUpdates();
    });
});
exports.serverwsocket = serverwsocket;
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
            sessionId: '1234',
            phoneNumberCliente,
            phoneNumberMaestro,
            nombreDelCliente,
            message
        })
    });
    console.log(apiResponse);
    if (!apiResponse.ok) {
        const errorResponse = yield apiResponse.text();
        throw new Error('Error al enviar el mensaje.');
    }
    const apiResult = yield apiResponse.json();
    const mensajeEnviado = {
        sessionId: "1234",
        to: phoneNumberCliente,
        from: phoneNumberMaestro,
        nombreDelCliente,
        message,
        status: 'Mensaje enviado correctamente'
    };
    return apiResult;
});
exports.funEnviarMensaje = funEnviarMensaje;
const verificarSesion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [existe, sesion] = yield (0, exports.funVerificarSesion)();
        if (existe) {
            return res.status(200).json({ mensaje: 'si', sesion: sesion });
        }
        else {
            return res.status(404).json({ mensaje: 'No hay  ninguna sesion activa' });
        }
    }
    catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.verificarSesion = verificarSesion;
const funVerificarSesion = () => __awaiter(void 0, void 0, void 0, function* () {
    const apiResponse = yield fetch(`${process.env.SERVER_MENSAJERIA}/api/whatsapp/ObtenerClientes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Origin': '181.129.218.198'
        }
    });
    console.log(apiResponse);
    const sesion = yield apiResponse.json();
    let existe;
    if (!sesion.clients || Object.keys(sesion.clients).length === 0) {
        existe = false;
    }
    else {
        existe = true;
    }
    const total = [existe, sesion.clients];
    return total;
});
exports.funVerificarSesion = funVerificarSesion;
const nuevaSesion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newQr = yield (0, exports.funNuevaSesion)('1234');
        const qrCodeString = yield qrcode_1.default.toString(newQr, { type: 'terminal', small: true });
        console.log(qrCodeString);
        res.status(200).json({ qr: newQr });
    }
    catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.nuevaSesion = nuevaSesion;
const funNuevaSesion = (sesion) => __awaiter(void 0, void 0, void 0, function* () {
    const apiResponse = yield fetch(`${process.env.SERVER_MENSAJERIA}/api/whatsapp/CrearCliente`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': '181.129.218.198'
        },
        body: JSON.stringify({
            sessionId: "1234"
        })
    });
    const qr = yield apiResponse.json();
    console.log(qr.qr);
    return yield qr.qr;
});
exports.funNuevaSesion = funNuevaSesion;
const eliminarSesion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiResponse = yield fetch(`${process.env.SERVER_MENSAJERIA}/api/whatsapp/eliminarClientes`, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json',
                'Origin': '181.129.218.198'
            }
        });
        return res.status(200).json({ data: apiResponse, mensaje: 'Todas las sesiones han sido eliminadas' });
    }
    catch (error) {
        console.error('Error al eliminar la sesion:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.eliminarSesion = eliminarSesion;
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
exports.mensajeGuardado = {
    mensaje: '¡Feliz cumpleaños! En Casa Olimpo, celebramos contigo este día especial. Que la luz de tu sonrisa brille aún más fuerte y que cada deseo de tu corazón se haga realidad. ¡Te enviamos un abrazo lleno de energía positiva!',
    hora: "10:00"
};
const obtenerMensaje = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Recibir cambio de mensaje
    try {
        const { mensaje, hora } = req.body;
        if (!mensaje || !hora) {
            return res.status(400).json({ error: 'Todso los campos son obligatorios' });
        }
        const resultado = yield (0, exports.funObtenerMensaje)(mensaje, hora);
        console.log(exports.mensajeGuardado);
        return res.status(200).json(resultado);
    }
    catch (error) {
        console.error('Error al programar la tarea:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.obtenerMensaje = obtenerMensaje;
const funObtenerMensaje = (mensaje, hora) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        exports.mensajeGuardado = { mensaje, hora };
        return exports.mensajeGuardado;
    }
    catch (error) {
        console.error('Error al guardar el mensaje', error);
        throw new Error('Error al guardar el mensaje');
    }
});
exports.funObtenerMensaje = funObtenerMensaje;
const mensajeToFront = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    //mostrar mensaje en el front
    if (!exports.mensajeGuardado || (((_a = exports.mensajeGuardado.mensaje) === null || _a === void 0 ? void 0 : _a.trim()) === '' && ((_b = exports.mensajeGuardado.hora) === null || _b === void 0 ? void 0 : _b.trim()) === '')) {
        exports.mensajeGuardado;
    }
    console.log(exports.mensajeGuardado);
    return res.status(200).json(exports.mensajeGuardado);
});
exports.mensajeToFront = mensajeToFront;
