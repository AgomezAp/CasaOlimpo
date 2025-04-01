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
exports.obtenerCitasPorDoctor = exports.obtenerCitas = exports.eliminarCita = exports.actualizarCita = exports.crearCita = void 0;
const agenda_1 = require("../models/agenda");
const user_1 = require("../models/user");
const paciente_1 = require("../models/paciente");
const dayjs_1 = __importDefault(require("dayjs"));
const crearCita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, numero_documento, fecha_cita, hora_cita, estado } = req.body;
    try {
        // Formatear y validar fecha primero
        const fechaFormateada = (0, dayjs_1.default)(fecha_cita, "YYYY-MM-DD");
        if (!fechaFormateada.isValid()) {
            return res.status(400).json({
                message: "Formato de fecha inválido. Use YYYY-MM-DD",
            });
        }
        // Validar formato de hora
        const horaRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
        if (!horaRegex.test(hora_cita)) {
            return res.status(400).json({
                message: "Formato de hora inválido. Use HH:MM o HH:MM:SS",
            });
        }
        // Validaciones de doctor y paciente...
        const doctor = yield user_1.User.findOne({ where: { correo } });
        if (!doctor) {
            return res.status(404).json({
                message: "El doctor con el correo proporcionado no existe.",
            });
        }
        const paciente = yield paciente_1.Paciente.findOne({ where: { numero_documento } });
        if (!paciente) {
            return res.status(404).json({
                message: "El paciente con el número de documento proporcionado no existe.",
            });
        }
        // Verificar cita exacta en la misma hora
        const citaExistente = yield agenda_1.Agenda.findOne({
            where: {
                fecha_cita: fechaFormateada.toDate(),
                hora_cita,
                correo,
            },
        });
        if (citaExistente) {
            return res.status(400).json({
                message: "Ya existe una cita programada para el doctor en la misma fecha y hora.",
            });
        }
        // NUEVA VALIDACIÓN: Verificar separación de 30 minutos entre citas
        // 1. Obtener todas las citas del médico para ese día
        const citasDelDia = yield agenda_1.Agenda.findAll({
            where: {
                correo,
                fecha_cita: fechaFormateada.toDate(),
            },
        });
        // 2. Convertir la hora de la nueva cita a minutos para comparación
        const [horaStr, minutosStr] = hora_cita.split(':');
        const nuevaCitaMinutos = parseInt(horaStr) * 60 + parseInt(minutosStr);
        // 3. Verificar si hay alguna cita demasiado cercana (menos de 30 minutos)
        const citaDemasiadoCercana = citasDelDia.some(cita => {
            const [horaExistente, minutosExistente] = cita.hora_cita.split(':');
            const citaExistenteMinutos = parseInt(horaExistente) * 60 + parseInt(minutosExistente);
            // Calcular la diferencia absoluta en minutos
            const diferencia = Math.abs(nuevaCitaMinutos - citaExistenteMinutos);
            // Si la diferencia es menor a 30 minutos, la cita está demasiado cercana
            return diferencia < 30;
        });
        if (citaDemasiadoCercana) {
            return res.status(400).json({
                message: "No se puede programar la cita. Debe haber al menos 30 minutos entre citas para el mismo doctor.",
            });
        }
        // Crear la cita solo si pasa todas las validaciones
        const nuevaCita = yield agenda_1.Agenda.create({
            correo,
            numero_documento,
            fecha_cita: fechaFormateada.toDate(),
            hora_cita,
            estado: estado || "Pendiente",
        });
        return res.status(201).json({
            message: "Cita creada correctamente",
            data: nuevaCita,
        });
    }
    catch (err) {
        console.error("Error creando cita:", err);
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
        // Si estás usando req.params.correo o req.params.numero_documento
        // asegúrate de que sea string:
        const { correo, numero_documento } = req.params;
        // Busca con los tipos correctos
        const citas = yield agenda_1.Agenda.findAll({
            where: Object.assign(Object.assign({}, (correo && { correo: String(correo) })), (numero_documento && { numero_documento: String(numero_documento) })),
            include: [
                { model: user_1.User, as: "doctor" },
                { model: paciente_1.Paciente, as: "paciente" }
            ]
        });
        return res.status(200).json({
            message: "Citas obtenidas correctamente",
            data: citas
        });
    }
    catch (err) {
        console.error("Error obteniendo las citas:", err);
        res.status(500).json({
            message: "Error obteniendo las citas",
            error: err.message
        });
    }
});
exports.obtenerCitas = obtenerCitas;
const obtenerCitasPorDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numero_documento } = req.params;
    try {
        const citas = yield agenda_1.Agenda.findAll({
            where: {
                numero_documento: numero_documento,
            },
            include: [
                { model: user_1.User, as: "doctor" },
                { model: paciente_1.Paciente, as: "paciente" }
            ]
        });
        return res.status(200).json({
            message: "Citas obtenidas correctamente",
            data: citas,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error obteniendo las citas",
            error: err.message,
        });
    }
});
exports.obtenerCitasPorDoctor = obtenerCitasPorDoctor;
