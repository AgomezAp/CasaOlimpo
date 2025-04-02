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
exports.enviarDescuento = void 0;
const paciente_1 = require("../models/paciente");
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
