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
exports.obtenerCitas = exports.eliminarCita = exports.actualizarCita = exports.crearCita = void 0;
const agenda_1 = require("../models/agenda");
const user_1 = require("../models/user");
const paciente_1 = require("../models/paciente");
const crearCita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, numero_documento, fecha_cita, hora_cita, estado } = req.body;
    try {
        // Validar si el doctor (User) existe
        const doctor = yield user_1.User.findOne({ where: { correo } });
        if (!doctor) {
            return res.status(404).json({
                message: "El doctor con el correo proporcionado no existe.",
            });
        }
        // Validar si el paciente (Paciente) existe
        const paciente = yield paciente_1.Paciente.findOne({ where: { numero_documento } });
        if (!paciente) {
            return res.status(404).json({
                message: "El paciente con el número de documento proporcionado no existe.",
            });
        }
        // Validar si ya existe una cita en la misma fecha y hora para el mismo doctor
        const citaExistente = yield agenda_1.Agenda.findOne({
            where: {
                fecha_cita,
                hora_cita,
                correo, // Validar que no haya solapamiento para el mismo doctor
            },
        });
        if (citaExistente) {
            return res.status(400).json({
                message: "Ya existe una cita programada para el doctor en la misma fecha y hora.",
            });
        }
        // Crear la nueva cita si no hay solapamiento
        const nuevaCita = yield agenda_1.Agenda.create({
            correo,
            numero_documento,
            fecha_cita,
            hora_cita,
            estado,
        });
        return res.status(201).json({
            message: "Cita creada correctamente",
            data: nuevaCita,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error creando la cita",
            error: err.message,
        });
    }
});
exports.crearCita = crearCita;
const actualizarCita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Aid } = req.params;
    const { correo, fecha_cita, hora_cita, estado } = req.body;
    try {
        const cita = yield agenda_1.Agenda.findByPk(Aid);
        if (!cita) {
            return res.status(404).json({
                message: "Cita no encontrada",
            });
        }
        cita.correo = correo;
        cita.fecha_cita = fecha_cita;
        cita.hora_cita = hora_cita;
        cita.estado = estado;
        yield cita.save();
        return res.status(200).json({
            message: "Cita actualizada correctamente",
            data: cita,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error actualizando la cita",
            error: err.message,
        });
    }
});
exports.actualizarCita = actualizarCita;
const eliminarCita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Aid } = req.params;
    try {
        // Buscar la cita por su ID
        const cita = yield agenda_1.Agenda.findByPk(Aid);
        if (!cita) {
            return res.status(404).json({
                message: "Cita no encontrada",
            });
        }
        // Obtener el correo del doctor y el número de documento del paciente asociados a la cita
        const correoUsuario = cita.correo;
        const numeroDocumentoPaciente = cita.numero_documento;
        // Eliminar todas las citas asociadas al doctor y al paciente
        yield agenda_1.Agenda.destroy({
            where: {
                correo: correoUsuario,
                numero_documento: numeroDocumentoPaciente,
            },
        });
        return res.status(200).json({
            message: `Todas las citas asociadas al doctor con correo ${correoUsuario} y al paciente con número de documento ${numeroDocumentoPaciente} han sido eliminadas.`,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error eliminando las citas",
            error: err.message,
        });
    }
});
exports.eliminarCita = eliminarCita;
const obtenerCitas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const citas = yield agenda_1.Agenda.findAll({
            include: [
                {
                    model: user_1.User,
                    as: 'doctor',
                    attributes: ['nombre', 'apellido'],
                },
                {
                    model: paciente_1.Paciente,
                    as: 'paciente',
                    attributes: ['nombre', 'apellido', 'telefono'],
                },
            ],
        });
        return res.status(200).json(citas);
    }
    catch (err) {
        res.status(500).json({
            message: "Error obteniendo las citas",
            error: err.message,
        });
    }
});
exports.obtenerCitas = obtenerCitas;
