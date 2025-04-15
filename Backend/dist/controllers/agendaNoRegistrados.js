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
exports.eliminarCitaNoRegistrado = exports.actualizarCitaNoRegistrado = exports.obtenerCitasNoRegistrados = exports.crearCitaNoRegistrado = void 0;
const agendaNoRegistrados_1 = require("../models/agendaNoRegistrados");
const agenda_1 = require("../models/agenda");
const user_1 = require("../models/user");
const sequelize_1 = require("sequelize");
const dayjs_1 = __importDefault(require("dayjs"));
const connection_1 = __importDefault(require("../database/connection"));
/**
 * Crea una cita para un paciente no registrado
 */
const crearCitaNoRegistrado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, fecha_cita, hora_cita, telefono, estado, nombre, apellidos, duracion } = req.body; // Asegúrate de que estos campos estén presentes
    try {
        // Validar formato de fecha
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
        // Validar que existe el doctor
        const doctor = yield user_1.User.findOne({ where: { correo } });
        if (!doctor) {
            return res.status(404).json({
                message: "El doctor con el correo proporcionado no existe.",
            });
        }
        // Validar teléfono
        if (!telefono || telefono.length < 7) {
            return res.status(400).json({
                message: "Debe proporcionar un número de teléfono válido.",
            });
        }
        if (!duracion || isNaN(Number(duracion)) || Number(duracion) <= 0) {
            return res.status(400).json({
                message: "La duración debe ser un número positivo en minutos",
            });
        }
        const fechaStr = fechaFormateada.format("YYYY-MM-DD");
        // 1. Verificar solapes con otras citas de pacientes NO registrados
        const citaNoRegistradaExistente = yield agendaNoRegistrados_1.AgendaNoRegistrados.findOne({
            where: {
                correo,
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                    { hora_cita },
                ],
            },
        });
        if (citaNoRegistradaExistente) {
            return res.status(400).json({
                message: "Ya existe una cita programada para el doctor en la misma fecha y hora con un paciente no registrado.",
            });
        }
        // 2. Verificar solapes con citas de pacientes registrados
        const citaRegistradaExistente = yield agenda_1.Agenda.findOne({
            where: {
                correo,
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                    { hora_cita },
                ],
            },
        });
        if (citaRegistradaExistente) {
            return res.status(400).json({
                message: "Ya existe una cita programada para el doctor en la misma fecha y hora con un paciente registrado.",
            });
        }
        // 3. VERIFICAR SEPARACIÓN DE 30 MINUTOS
        // a. Con citas de pacientes no registrados
        const citasNoRegistradasDelDia = yield agendaNoRegistrados_1.AgendaNoRegistrados.findAll({
            where: {
                correo,
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                ],
            },
            raw: true,
        });
        // b. Con citas de pacientes registrados
        const citasRegistradasDelDia = yield agenda_1.Agenda.findAll({
            where: {
                correo,
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                ],
            },
            raw: true,
        });
        // Combinar ambas listas de citas
        const todasLasCitasDelDia = [
            ...citasNoRegistradasDelDia,
            ...citasRegistradasDelDia,
        ];
        // Convertir la hora de la nueva cita a minutos para comparación
        const [horaStr, minutosStr] = hora_cita.split(":");
        const nuevaCitaMinutos = parseInt(horaStr) * 60 + parseInt(minutosStr);
        // Verificar si hay alguna cita demasiado cercana (menos de 30 minutos)
        const citaDemasiadoCercana = todasLasCitasDelDia.some((cita) => {
            const [horaExistente, minutosExistente] = cita.hora_cita.split(":");
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
        // 4. Crear la cita
        const nuevaCita = yield agendaNoRegistrados_1.AgendaNoRegistrados.create({
            nombre, // Asegúrate de que estos campos estén presentes
            apellidos,
            correo,
            fecha_cita: fechaFormateada.toDate(),
            hora_cita,
            telefono,
            estado: estado || "Pendiente",
            duracion: Number(duracion)
        });
        return res.status(201).json({
            message: "Cita para paciente no registrado creada correctamente",
            data: nuevaCita,
        });
    }
    catch (err) {
        console.error("Error creando cita para paciente no registrado:", err);
        res.status(500).json({
            message: "Error creando la cita",
            error: err.message,
        });
    }
});
exports.crearCitaNoRegistrado = crearCitaNoRegistrado;
/**
 * Obtiene todas las citas de pacientes no registrados
 */
const obtenerCitasNoRegistrados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { correo } = req.query;
        const citas = yield agendaNoRegistrados_1.AgendaNoRegistrados.findAll({
            where: Object.assign({}, (correo && { correo: String(correo) })),
            include: [
                {
                    model: user_1.User,
                    as: "User",
                    attributes: ['Uid', 'correo', 'nombre', 'rol'], // Define solo los campos que necesitas
                    required: false
                }
            ],
        });
        return res.status(200).json({
            message: "Citas de pacientes no registrados obtenidas correctamente",
            data: citas,
        });
    }
    catch (err) {
        console.error("Error obteniendo las citas:", err);
        res.status(500).json({
            message: "Error obteniendo las citas",
            error: err.message,
        });
    }
});
exports.obtenerCitasNoRegistrados = obtenerCitasNoRegistrados;
/**
 * Actualiza una cita de paciente no registrado
 */
/**
 * Actualiza una cita de paciente no registrado
 */
const actualizarCitaNoRegistrado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ANRid } = req.params;
    const datosActualizados = req.body;
    try {
        // 1. Verificar si la cita existe
        const cita = yield agendaNoRegistrados_1.AgendaNoRegistrados.findByPk(ANRid);
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        // 2. Preparar campos a actualizar
        const actualizaciones = {};
        // 3. Validar y preparar todos los campos que se van a actualizar
        // Fecha
        let fechaParaValidar = cita.fecha_cita; // Valor actual por defecto
        if (datosActualizados.fecha_cita) {
            const fechaFormateada = (0, dayjs_1.default)(datosActualizados.fecha_cita, "YYYY-MM-DD");
            if (!fechaFormateada.isValid()) {
                return res.status(400).json({ message: "Formato de fecha inválido. Use YYYY-MM-DD" });
            }
            actualizaciones.fecha_cita = fechaFormateada.toDate();
            fechaParaValidar = fechaFormateada.toDate();
        }
        // Hora
        let horaParaValidar = cita.hora_cita; // Valor actual por defecto
        if (datosActualizados.hora_cita) {
            const horaRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
            if (!horaRegex.test(datosActualizados.hora_cita)) {
                return res.status(400).json({ message: "Formato de hora inválido. Use HH:MM o HH:MM:SS" });
            }
            actualizaciones.hora_cita = datosActualizados.hora_cita;
            horaParaValidar = datosActualizados.hora_cita;
        }
        // Doctor (correo)
        let correoParaValidar = cita.correo; // Valor actual por defecto
        if (datosActualizados.correo) {
            const doctor = yield user_1.User.findOne({ where: { correo: datosActualizados.correo } });
            if (!doctor) {
                return res.status(404).json({ message: "El doctor con el correo proporcionado no existe" });
            }
            actualizaciones.correo = datosActualizados.correo;
            correoParaValidar = datosActualizados.correo;
        }
        // Teléfono
        if (datosActualizados.telefono) {
            if (datosActualizados.telefono.length < 7) {
                return res.status(400).json({ message: "Debe proporcionar un número de teléfono válido." });
            }
            actualizaciones.telefono = datosActualizados.telefono;
        }
        // Estado
        if (datosActualizados.estado !== undefined) {
            const estadosValidos = ["Confirmada", "Cancelada", "Pendiente"];
            if (!estadosValidos.includes(datosActualizados.estado)) {
                return res.status(400).json({
                    message: "Estado inválido. Use: Confirmada, Cancelada o Pendiente"
                });
            }
            actualizaciones.estado = datosActualizados.estado;
        }
        if (datosActualizados.duracion !== undefined) {
            const duracionNum = Number(datosActualizados.duracion);
            if (isNaN(duracionNum) || duracionNum <= 0) {
                return res.status(400).json({
                    message: "La duración debe ser un número positivo en minutos"
                });
            }
            actualizaciones.duracion = duracionNum;
        }
        // 4. Si no hay nada que actualizar, retornar error
        if (Object.keys(actualizaciones).length === 0) {
            return res.status(400).json({ message: "No se proporcionaron datos para actualizar" });
        }
        // 5. Si se está cambiando fecha, hora o doctor, realizar validaciones
        if (datosActualizados.fecha_cita || datosActualizados.hora_cita || datosActualizados.correo) {
            // Realizar todas las verificaciones de solape (similar a crearCitaNoRegistrado)
            // Pero excluyendo la cita actual
            const fechaStr = (0, dayjs_1.default)(fechaParaValidar).format('YYYY-MM-DD');
            // Verificar solapes con otras citas de no registrados
            const citaNoRegistradaExistente = yield agendaNoRegistrados_1.AgendaNoRegistrados.findOne({
                where: {
                    correo: correoParaValidar,
                    ANRid: { [sequelize_1.Op.ne]: ANRid },
                    [sequelize_1.Op.and]: [
                        connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                        { hora_cita: horaParaValidar },
                    ],
                },
            });
            if (citaNoRegistradaExistente) {
                return res.status(400).json({
                    message: "Ya existe una cita para paciente no registrado en la misma fecha y hora."
                });
            }
            // Verificar solapes con citas de pacientes registrados
            const citaRegistradaExistente = yield agenda_1.Agenda.findOne({
                where: {
                    correo: correoParaValidar,
                    [sequelize_1.Op.and]: [
                        connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                        { hora_cita: horaParaValidar },
                    ],
                },
            });
            if (citaRegistradaExistente) {
                return res.status(400).json({
                    message: "Ya existe una cita con paciente registrado en la misma fecha y hora."
                });
            }
            // VERIFICACIÓN DE SEPARACIÓN DE 30 MINUTOS
            // 1. Obtener todas las citas de pacientes NO registrados del día (excepto la actual)
            const citasNoRegistradasDelDia = yield agendaNoRegistrados_1.AgendaNoRegistrados.findAll({
                where: {
                    correo: correoParaValidar,
                    ANRid: { [sequelize_1.Op.ne]: ANRid }, // Excluir la cita actual
                    [sequelize_1.Op.and]: [
                        connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr)
                    ]
                },
                raw: true
            });
            // 2. Obtener todas las citas de pacientes registrados del día
            const citasRegistradasDelDia = yield agenda_1.Agenda.findAll({
                where: {
                    correo: correoParaValidar,
                    [sequelize_1.Op.and]: [
                        connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr)
                    ]
                },
                raw: true
            });
            // 3. Combinar ambas listas para verificación completa
            const todasLasCitasDelDia = [
                ...citasNoRegistradasDelDia,
                ...citasRegistradasDelDia
            ];
            console.log(`Total de citas a verificar: ${todasLasCitasDelDia.length}`);
            console.log(`${citasNoRegistradasDelDia.length} de pacientes no registrados`);
            console.log(`${citasRegistradasDelDia.length} de pacientes registrados`);
            // 4. Convertir la hora de la cita que se está actualizando a minutos
            const [horaActualStr, minutosActualStr] = horaParaValidar.split(":");
            const nuevaCitaMinutos = parseInt(horaActualStr) * 60 + parseInt(minutosActualStr);
            console.log(`Hora a actualizar: ${horaParaValidar} (${nuevaCitaMinutos} minutos)`);
            // 5. Verificar proximidad con cada cita existente
            for (const c of todasLasCitasDelDia) {
                try {
                    const [horaCitaStr, minutosCitaStr] = c.hora_cita.split(":");
                    const citaExistenteMinutos = parseInt(horaCitaStr) * 60 + parseInt(minutosCitaStr);
                    // Calcular diferencia absoluta en minutos
                    const diferencia = Math.abs(nuevaCitaMinutos - citaExistenteMinutos);
                    console.log(`Comparando con cita a las ${c.hora_cita} (${citaExistenteMinutos} min) - Diferencia: ${diferencia} minutos`);
                    // Si la diferencia es menor a 30 minutos
                    if (diferencia < 30) {
                        const tipoRegistro = c.hasOwnProperty('ANRid') ? 'no registrado' : 'registrado';
                        console.log(`¡CONFLICTO! Cita demasiado cercana con paciente ${tipoRegistro} a las ${c.hora_cita}`);
                        return res.status(400).json({
                            message: "No se puede actualizar la cita. Debe haber al menos 30 minutos entre citas para el mismo doctor."
                        });
                    }
                }
                catch (error) {
                    console.error(`Error procesando hora para cita:`, error);
                    // Continuar con la siguiente cita si hay error
                }
            }
        }
        // 6. Actualizar la cita
        yield cita.update(actualizaciones);
        return res.status(200).json({
            message: "Cita actualizada correctamente",
            data: cita
        });
    }
    catch (err) {
        console.error("Error actualizando cita:", err);
        res.status(500).json({
            message: "Error actualizando la cita",
            error: err.message
        });
    }
});
exports.actualizarCitaNoRegistrado = actualizarCitaNoRegistrado;
/**
 * Elimina una cita de paciente no registrado
 */
const eliminarCitaNoRegistrado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ANRid } = req.params;
    try {
        const cita = yield agendaNoRegistrados_1.AgendaNoRegistrados.findByPk(ANRid);
        if (!cita) {
            return res.status(404).json({
                message: "Cita no encontrada"
            });
        }
        yield cita.destroy();
        return res.status(200).json({
            message: `La cita con ID ${ANRid} ha sido eliminada correctamente.`
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error eliminando la cita",
            error: err.message
        });
    }
});
exports.eliminarCitaNoRegistrado = eliminarCitaNoRegistrado;
