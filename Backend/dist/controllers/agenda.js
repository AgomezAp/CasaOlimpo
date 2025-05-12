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
exports.getHorasOcupadas = exports.obtenerCitasPorPaciente = exports.obtenerCitasPorDoctor = exports.obtenerCitas = exports.eliminarCita = exports.actualizarCita = exports.crearCita = void 0;
const agenda_1 = require("../models/agenda");
const user_1 = require("../models/user");
const paciente_1 = require("../models/paciente");
const dayjs_1 = __importDefault(require("dayjs"));
const sequelize_1 = require("sequelize"); // Importar operadores de Sequelize
const connection_1 = __importDefault(require("../database/connection"));
const agendaNoRegistrados_1 = require("../models/agendaNoRegistrados");
const encriptado_1 = require("./encriptado");
const paciente_2 = require("./paciente");
function desencriptarAgenda(agenda) {
    if (!agenda)
        return agenda;
    // Lista de campos que NO requieren desencriptación
    const camposSinDesencriptar = [
        'Aid', 'fecha_cita', 'hora_cita', 'estado', 'correo',
        'numero_documento', 'createdAt', 'updatedAt', 'duracion'
    ];
    // Clonar el objeto para no modificar el original
    const agendaDesencriptada = Object.assign({}, agenda);
    // Desencriptar todos los campos excepto los que están en la lista de exclusión
    Object.keys(agendaDesencriptada).forEach(campo => {
        if (!camposSinDesencriptar.includes(campo) && agendaDesencriptada[campo]) {
            try {
                // Verificar si parece un texto encriptado
                if (typeof agendaDesencriptada[campo] === 'string' &&
                    agendaDesencriptada[campo].match(/^[A-Za-z0-9+/=]{20,}$/)) {
                    agendaDesencriptada[campo] = (0, encriptado_1.decryptData)(agendaDesencriptada[campo]);
                }
            }
            catch (error) {
                console.error(`Error al desencriptar campo ${campo} en agenda:`, error);
            }
        }
    });
    return agendaDesencriptada;
}
const crearCita = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, numero_documento, fecha_cita, hora_cita, estado, descripcion, telefono, duracion, } = req.body;
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
        // VERIFICACIÓN CRUZADA: Verificar solapamiento con pacientes NO REGISTRADOS
        const fechaStr = fechaFormateada.format('YYYY-MM-DD');
        const citaNoRegistradaExistente = yield agendaNoRegistrados_1.AgendaNoRegistrados.findOne({
            where: {
                correo,
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                    { hora_cita }
                ]
            }
        });
        if (citaNoRegistradaExistente) {
            return res.status(400).json({
                message: "Ya existe una cita programada para el doctor en la misma fecha y hora con un paciente no registrado."
            });
        }
        // VERIFICACIÓN CRUZADA: Obtener citas de NO REGISTRADOS del mismo día
        const citasNoRegistradasDelDia = yield agendaNoRegistrados_1.AgendaNoRegistrados.findAll({
            where: {
                correo,
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr)
                ]
            },
            raw: true
        });
        // Usar todasLasCitasDelDia en lugar de citasDelDia para la verificación de 30 minutos
        // NUEVA VALIDACIÓN: Verificar separación de 30 minutos entre citas
        // 1. Obtener todas las citas del médico para ese día
        const citasDelDia = yield agenda_1.Agenda.findAll({
            where: {
                correo,
                fecha_cita: fechaFormateada.toDate(),
            },
        });
        const todasLasCitasDelDia = [...citasDelDia, ...citasNoRegistradasDelDia];
        // 2. Convertir la hora de la nueva cita a minutos para comparación
        const [horaStr, minutosStr] = hora_cita.split(":");
        const nuevaCitaMinutos = parseInt(horaStr) * 60 + parseInt(minutosStr);
        // 3. Verificar si hay alguna cita demasiado cercana (menos de 30 minutos)
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
        // Crear la cita solo si pasa todas las validaciones
        const nuevaCita = yield agenda_1.Agenda.create({
            correo,
            numero_documento,
            fecha_cita: fechaFormateada.toDate(),
            hora_cita,
            estado: estado || "Pendiente",
            descripcion,
            telefono,
            duracion
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
    const datosActualizados = req.body;
    try {
        // 1. Verificar si la cita existe
        const cita = yield agenda_1.Agenda.findByPk(Aid);
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
                return res
                    .status(400)
                    .json({ message: "Formato de fecha inválido. Use YYYY-MM-DD" });
            }
            actualizaciones.fecha_cita = fechaFormateada.toDate();
            fechaParaValidar = fechaFormateada.toDate();
        }
        // Hora
        let horaParaValidar = cita.hora_cita; // Valor actual por defecto
        if (datosActualizados.hora_cita) {
            const horaRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
            if (!horaRegex.test(datosActualizados.hora_cita)) {
                return res
                    .status(400)
                    .json({ message: "Formato de hora inválido. Use HH:MM o HH:MM:SS" });
            }
            actualizaciones.hora_cita = datosActualizados.hora_cita;
            horaParaValidar = datosActualizados.hora_cita;
        }
        // Doctor (correo)
        let correoParaValidar = cita.correo; // Valor actual por defecto
        if (datosActualizados.correo) {
            const doctor = yield user_1.User.findOne({
                where: { correo: datosActualizados.correo },
            });
            if (!doctor) {
                return res
                    .status(404)
                    .json({ message: "El doctor con el correo proporcionado no existe" });
            }
            actualizaciones.correo = datosActualizados.correo;
            correoParaValidar = datosActualizados.correo;
        }
        // Estado
        if (datosActualizados.estado !== undefined) {
            const estadosValidos = ["Confirmada", "Cancelada", "Pendiente"];
            if (!estadosValidos.includes(datosActualizados.estado)) {
                return res
                    .status(400)
                    .json({
                    message: "Estado inválido. Use: Confirmada, Cancelada o Pendiente",
                });
            }
            actualizaciones.estado = datosActualizados.estado;
        }
        // Descripción - Encriptar al actualizar
        if (datosActualizados.descripcion !== undefined) {
            actualizaciones.descripcion = (0, encriptado_1.encryptData)(datosActualizados.descripcion);
        }
        // Teléfono - Encriptar al actualizar
        if (datosActualizados.telefono !== undefined) {
            actualizaciones.telefono = (0, encriptado_1.encryptData)(datosActualizados.telefono);
        }
        // Duración
        if (datosActualizados.duracion !== undefined) {
            actualizaciones.duracion = datosActualizados.duracion;
        }
        // 4. Si no hay nada que actualizar, retornar error
        if (Object.keys(actualizaciones).length === 0) {
            return res
                .status(400)
                .json({ message: "No se proporcionaron datos para actualizar" });
        }
        // 5. Si se está cambiando fecha, hora o doctor, realizar validaciones
        if (datosActualizados.fecha_cita ||
            datosActualizados.hora_cita ||
            datosActualizados.correo) {
            console.log("—— INFORMACIÓN DE VALIDACIÓN ——");
            console.log(`Fecha para validar: ${(0, dayjs_1.default)(fechaParaValidar).format("YYYY-MM-DD")}`);
            console.log(`Hora para validar: ${horaParaValidar}`);
            console.log(`Correo para validar: ${correoParaValidar}`);
            const fechaStr = (0, dayjs_1.default)(fechaParaValidar).format("YYYY-MM-DD");
            // CLAVE: Usar Sequelize.literal para filtrar por fecha correctamente
            const citasEnMismoDia = yield agenda_1.Agenda.findAll({
                where: {
                    correo: correoParaValidar,
                    Aid: { [sequelize_1.Op.ne]: Aid }, // Excluir la cita actual
                    [sequelize_1.Op.and]: [
                        connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr),
                    ],
                },
                raw: true,
            });
            console.log(`Encontradas ${citasEnMismoDia.length} citas en el mismo día`);
            // Verificar si hay citas en la misma hora
            const citasMismaHora = citasEnMismoDia.filter((c) => {
                const horaActual = horaParaValidar.split(":").slice(0, 2).join(":");
                const horaCita = c.hora_cita.split(":").slice(0, 2).join(":");
                console.log(`Comparando horas - Actual: ${horaActual}, Cita: ${horaCita}`);
                return horaActual === horaCita;
            });
            const citasNoRegistradasDelDia = yield agendaNoRegistrados_1.AgendaNoRegistrados.findAll({
                where: {
                    correo: correoParaValidar,
                    [sequelize_1.Op.and]: [
                        connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr)
                    ]
                },
                raw: true
            });
            console.log(`Encontradas ${citasNoRegistradasDelDia.length} citas de pacientes no registrados`);
            // Combinar todas las citas para verificación
            const todasLasCitasDelDia = [
                ...citasEnMismoDia,
                ...citasNoRegistradasDelDia
            ];
            if (citasMismaHora.length > 0) {
                console.log("¡CONFLICTO! Cita en la misma hora:", citasMismaHora);
                return res.status(400).json({
                    message: "Ya existe una cita programada para el doctor en la misma fecha y hora",
                });
            }
            // Verificar proximidad (30 minutos)
            const [horaActualStr, minutosActualStr] = horaParaValidar.split(":");
            const nuevaCitaMinutos = parseInt(horaActualStr) * 60 + parseInt(minutosActualStr);
            // Log para depuración
            console.log(`Hora actual en minutos: ${nuevaCitaMinutos}`);
            // Verificar cada cita para ver si está a menos de 30 minutos
            for (const c of todasLasCitasDelDia) {
                const [horaCitaStr, minutosCitaStr] = c.hora_cita.split(":");
                const citaMinutos = parseInt(horaCitaStr) * 60 + parseInt(minutosCitaStr);
                const diferencia = Math.abs(nuevaCitaMinutos - citaMinutos);
                console.log(`Cita existente: ${c.hora_cita} (${citaMinutos} min), Diferencia: ${diferencia} min`);
                if (diferencia < 30) {
                    console.log(`¡CONFLICTO! Cita demasiado cercana: ${c.hora_cita}, Diferencia: ${diferencia} min`);
                    return res.status(400).json({
                        message: "No se puede actualizar la cita. Debe haber al menos 30 minutos entre citas para el mismo doctor",
                    });
                }
            }
        }
        // 6. Actualizar la cita con los campos proporcionados
        yield cita.update(actualizaciones);
        // 7. Obtener la cita actualizada para desencriptarla
        const citaActualizada = yield agenda_1.Agenda.findByPk(Aid, {
            include: [
                { model: user_1.User, as: "doctor" },
                { model: paciente_1.Paciente, as: "paciente" }
            ]
        });
        if (!citaActualizada) {
            return res.status(404).json({
                message: "Error al obtener la cita actualizada"
            });
        }
        // 8. Desencriptar datos para la respuesta
        const citaJSON = citaActualizada.toJSON();
        const citaDesencriptada = desencriptarAgenda(citaJSON);
        return res.status(200).json({
            message: "Cita actualizada correctamente",
            data: citaDesencriptada,
        });
    }
    catch (err) {
        console.error("Error actualizando cita:", err);
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
                message: "Cita no encontrada"
            });
        }
        // Eliminar SOLO esta cita específica
        yield cita.destroy();
        return res.status(200).json({
            message: `La cita con ID ${Aid} ha sido eliminada correctamente.`
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error eliminando la cita",
            error: err.message
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
                { model: paciente_1.Paciente, as: "paciente" },
            ],
        });
        // Desencriptar los datos de todas las citas
        const citasDesencriptadas = citas.map(cita => {
            const citaJSON = cita.toJSON();
            const citaDesencriptada = desencriptarAgenda(citaJSON);
            // Si el paciente tiene datos encriptados y existe la función para desencriptarlos
            if (citaDesencriptada.paciente && typeof paciente_2.desencriptarPacienteCompleto === 'function') {
                citaDesencriptada.paciente = (0, paciente_2.desencriptarPacienteCompleto)(citaDesencriptada.paciente);
            }
            return citaDesencriptada;
        });
        return res.status(200).json({
            message: "Citas obtenidas correctamente",
            data: citasDesencriptadas,
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
                { model: paciente_1.Paciente, as: "paciente" },
            ],
        });
        // Desencriptar los datos de todas las citas
        const citasDesencriptadas = citas.map(cita => {
            const citaJSON = cita.toJSON();
            const citaDesencriptada = desencriptarAgenda(citaJSON);
            // Si hay datos de paciente disponibles
            if (citaDesencriptada.paciente && typeof paciente_2.desencriptarPacienteCompleto === 'function') {
                citaDesencriptada.paciente = (0, paciente_2.desencriptarPacienteCompleto)(citaDesencriptada.paciente);
            }
            return citaDesencriptada;
        });
        return res.status(200).json({
            message: "Citas obtenidas correctamente",
            data: citasDesencriptadas,
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
/**
 * Obtiene todas las citas de un paciente por su número de documento
 */
const obtenerCitasPorPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        if (!numero_documento) {
            return res.status(400).json({
                message: "Se requiere el número de documento del paciente"
            });
        }
        // Buscar todas las citas del paciente
        const citas = yield agenda_1.Agenda.findAll({
            where: {
                numero_documento
            },
            attributes: ['Aid', 'fecha_cita', 'hora_cita', 'estado', 'descripcion', 'telefono', 'duracion'],
            include: [
                {
                    model: user_1.User,
                    as: "doctor",
                    attributes: ['nombre']
                }
            ],
            order: [
                ['fecha_cita', 'ASC'],
                ['hora_cita', 'ASC']
            ]
        });
        if (citas.length === 0) {
            return res.status(200).json({
                message: "El paciente no tiene citas programadas",
                data: []
            });
        }
        // Desencriptar cada cita antes de enviarla
        const citasDesencriptadas = citas.map(cita => desencriptarAgenda(cita.toJSON()));
        return res.status(200).json({
            message: "Citas del paciente obtenidas correctamente",
            total_citas: citas.length,
            data: citasDesencriptadas
        });
    }
    catch (err) {
        console.error("Error obteniendo las citas del paciente:", err);
        return res.status(500).json({
            message: "Error al obtener las citas del paciente",
            error: err.message
        });
    }
});
exports.obtenerCitasPorPaciente = obtenerCitasPorPaciente;
const getHorasOcupadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fecha } = req.params;
        // Validar formato de fecha
        const fechaFormateada = (0, dayjs_1.default)(fecha, "YYYY-MM-DD");
        if (!fechaFormateada.isValid()) {
            return res.status(400).json({
                message: "Formato de fecha inválido. Use YYYY-MM-DD",
                data: []
            });
        }
        const fechaStr = fechaFormateada.format('YYYY-MM-DD');
        // Obtener citas de pacientes registrados
        const citasRegistradas = yield agenda_1.Agenda.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr)
                ]
            },
            attributes: ['hora_cita', 'duracion'],
            raw: true
        });
        // Obtener citas de pacientes no registrados
        const citasNoRegistradas = yield agendaNoRegistrados_1.AgendaNoRegistrados.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    connection_1.default.where(connection_1.default.fn("DATE", connection_1.default.col("fecha_cita")), fechaStr)
                ]
            },
            attributes: ['hora_cita', 'duracion'],
            raw: true
        });
        // Combinar todas las citas
        const todasLasCitas = [...citasRegistradas, ...citasNoRegistradas];
        // Extraer horas ocupadas considerando la duración de cada cita
        const horasOcupadas = new Set();
        todasLasCitas.forEach(cita => {
            // Hora base de la cita
            const [horas, minutos] = cita.hora_cita.split(':').map(Number);
            let citaMinutos = horas * 60 + minutos;
            // Duración de la cita (por defecto 30 minutos si no está definida)
            const duracion = cita.duracion || 30;
            // Añadir la hora base
            horasOcupadas.add(cita.hora_cita.substring(0, 5));
            // Añadir intervalos de 30 minutos durante la duración de la cita
            for (let i = 30; i < duracion; i += 30) {
                const nuevoMinuto = citaMinutos + i;
                const nuevaHora = Math.floor(nuevoMinuto / 60).toString().padStart(2, '0');
                const nuevoMinutoStr = (nuevoMinuto % 60).toString().padStart(2, '0');
                horasOcupadas.add(`${nuevaHora}:${nuevoMinutoStr}`);
            }
        });
        // Convertir Set a Array para la respuesta
        const horasOcupadasArray = Array.from(horasOcupadas).sort();
        return res.status(200).json({
            message: "Horas ocupadas obtenidas correctamente",
            data: horasOcupadasArray
        });
    }
    catch (err) {
        console.error("Error obteniendo horas ocupadas:", err);
        return res.status(500).json({
            message: "Error al obtener horas ocupadas",
            error: err.message,
            data: []
        });
    }
});
exports.getHorasOcupadas = getHorasOcupadas;
