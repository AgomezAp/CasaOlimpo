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
exports.cerrarConsulta = exports.getConsultasDoctor = exports.getConsultasPorPaciente = exports.updateConsulta = exports.getConsulta = exports.nuevaConsulta = exports.uploadConsentimiento = void 0;
const consulta_1 = require("../models/consulta");
const paciente_1 = require("../models/paciente");
const user_1 = require("../models/user");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage(); // Almacena en memoria
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB máximo (el doble de tu archivo actual)
    }
});
exports.uploadConsentimiento = upload.single('consentimiento_info');
const nuevaConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        const { motivo, enfermedad_actual, objetivos_terapia, historia_problema, desarrollo, plan_terapeutico, tipo_diagnostico, analisis_diagnostico, plan_tratamiento, recomendaciones, fecha, 
        // ELIMINAR correo de aquí, lo obtendremos del usuario
        consentimiento_check, abierto, Uid } = req.body;
        const consentimientoArchivo = req.file ? req.file.buffer : null;
        if (!Uid) {
            return res.status(400).json({
                message: "Se requiere ID de usuario (doctor) para crear una consulta"
            });
        }
        // Verificar que el usuario existe y es un doctor
        const doctor = yield user_1.User.findByPk(Uid);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor no encontrado" });
        }
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({
                message: "El paciente no existe",
                numero_documento
            });
        }
        const correoDoctor = doctor.correo;
        // NUEVO: Buscar consultas abiertas del paciente
        const consultasAbiertas = yield consulta_1.Consulta.findAll({
            where: {
                numero_documento,
                abierto: true
            }
        });
        // NUEVO: Cerrar automáticamente todas las consultas abiertas
        if (consultasAbiertas.length > 0) {
            for (const consulta of consultasAbiertas) {
                yield consulta.update({
                    abierto: false,
                    motivo_cierre: "Cerrada automáticamente al crear nueva consulta",
                    fecha_cierre: new Date(),
                    cerrado_por: Uid
                });
            }
            console.log(`Se cerraron automáticamente ${consultasAbiertas.length} consultas previas del paciente ${numero_documento}`);
        }
        // Crear la nueva consulta
        const nuevaConsulta = yield consulta_1.Consulta.create({
            Uid,
            numero_documento,
            motivo,
            enfermedad_actual,
            objetivos_terapia,
            historia_problema,
            desarrollo,
            plan_terapeutico,
            tipo_diagnostico,
            analisis_diagnostico,
            plan_tratamiento,
            recomendaciones,
            fecha: fecha || new Date(),
            correo: correoDoctor, // USAR EL CORREO OBTENIDO DEL DOCTOR
            consentimiento_info: consentimientoArchivo,
            consentimiento_check: req.file ? true : false,
            abierto: abierto !== undefined ? abierto : true,
            fecha_creacion: new Date()
        });
        return res.status(201).json({
            message: "Consulta creada correctamente",
            consultasAnterioresCerradas: consultasAbiertas.length,
            consulta: Object.assign(Object.assign({}, nuevaConsulta.toJSON()), { doctor: {
                    id: doctor.Uid,
                    nombre: doctor.nombre
                }, paciente: {
                    numero_documento: paciente.numero_documento,
                    nombre: paciente.nombre,
                    apellidos: paciente.apellidos
                } })
        });
    }
    catch (error) {
        console.error('Error al crear la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({
            message: 'Error interno del servidor al crear consulta',
            error: errorMessage
        });
    }
});
exports.nuevaConsulta = nuevaConsulta;
const getConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Cid } = req.params; // Usar params en lugar de body
        if (!Cid) {
            return res.status(400).json({
                message: "Se requiere ID de consulta"
            });
        }
        const consulta = yield consulta_1.Consulta.findByPk(Cid, {
            include: [
                {
                    model: user_1.User,
                    as: 'User',
                    attributes: ['Uid', 'nombre', 'rol']
                },
                {
                    model: paciente_1.Paciente,
                    as: 'paciente',
                    attributes: ['numero_documento', 'nombre', 'apellidos']
                }
            ]
        });
        if (!consulta) {
            return res.status(404).json({
                message: 'Consulta no encontrada',
                Cid
            });
        }
        return res.status(200).json({
            message: "Consulta obtenida correctamente",
            data: consulta
        });
    }
    catch (error) {
        console.error('Error al obtener la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({
            message: 'Error interno del servidor al obtener consulta',
            error: errorMessage
        });
    }
});
exports.getConsulta = getConsulta;
const updateConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Cid } = req.params;
        const updatedData = req.body;
        if (!Cid) {
            return res.status(400).json({
                message: "ID de la consulta no proporcionado"
            });
        }
        // Buscar la consulta existente
        const consulta = yield consulta_1.Consulta.findByPk(Cid);
        if (!consulta) {
            return res.status(404).json({
                message: "Consulta no encontrada",
                Cid
            });
        }
        // Verificar que la consulta está abierta
        if (consulta.abierto === false) {
            return res.status(400).json({
                message: "La consulta ya ha sido cerrada y no se puede actualizar"
            });
        }
        // Registrar la última actualización
        updatedData.ultima_actualizacion = new Date();
        // Actualizar solo los campos proporcionados
        yield consulta.update(updatedData);
        // Obtener la consulta actualizada con sus relaciones
        const consultaActualizada = yield consulta_1.Consulta.findByPk(Cid, {
            include: [
                {
                    model: user_1.User,
                    as: 'User',
                    attributes: ['Uid', 'nombre', 'rol']
                },
                {
                    model: paciente_1.Paciente,
                    as: 'paciente',
                    attributes: ['numero_documento', 'nombre', 'apellidos']
                }
            ]
        });
        // Responder con éxito
        return res.status(200).json({
            message: "Consulta actualizada correctamente",
            data: consultaActualizada
        });
    }
    catch (error) {
        console.error('Error al actualizar la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({
            message: 'Error interno del servidor al actualizar consulta',
            error: errorMessage
        });
    }
});
exports.updateConsulta = updateConsulta;
const getConsultasPorPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({
                message: "Paciente no encontrado"
            });
        }
        // Paso 1: Obtener solo las consultas sin incluir el usuario
        const consultas = yield consulta_1.Consulta.findAll({
            where: { numero_documento },
            order: [['fecha', 'DESC']]
        });
        // Paso 2: Para cada consulta, buscar manualmente la información del doctor
        const resultado = [];
        for (const consulta of consultas) {
            // Obtener los datos del doctor usando el Uid de la consulta
            const doctor = yield user_1.User.findByPk(consulta.Uid, {
                attributes: ['Uid', 'nombre', 'rol']
            });
            // Combinar la consulta con los datos del doctor
            resultado.push(Object.assign(Object.assign({}, consulta.toJSON()), { doctor: doctor ? doctor.toJSON() : null }));
        }
        return res.status(200).json({
            message: "Consultas obtenidas correctamente",
            total: consultas.length,
            data: resultado
        });
    }
    catch (error) {
        console.error('Error al obtener consultas del paciente:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({
            message: 'Error interno del servidor al obtener consultas',
            error: errorMessage
        });
    }
});
exports.getConsultasPorPaciente = getConsultasPorPaciente;
const getConsultasDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Uid } = req.params;
        if (!Uid) {
            return res.status(400).json({
                message: "Se requiere ID del doctor"
            });
        }
        // Verificar que el doctor existe
        const doctor = yield user_1.User.findByPk(Uid);
        if (!doctor) {
            return res.status(404).json({
                message: "Doctor no encontrado"
            });
        }
        const consultas = yield consulta_1.Consulta.findAll({
            where: { Uid },
            include: [
                {
                    model: paciente_1.Paciente,
                    as: 'paciente',
                    attributes: ['numero_documento', 'nombre', 'apellidos']
                }
            ],
            order: [['fecha', 'DESC']]
        });
        return res.status(200).json({
            message: "Consultas obtenidas correctamente",
            total: consultas.length,
            doctor: {
                nombre: doctor.nombre,
                rol: doctor.rol
            },
            data: consultas
        });
    }
    catch (error) {
        console.error('Error al obtener consultas del doctor:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({
            message: 'Error interno del servidor al obtener consultas',
            error: errorMessage
        });
    }
});
exports.getConsultasDoctor = getConsultasDoctor;
const cerrarConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Cid } = req.params;
        const { motivo_cierre, Uid } = req.body;
        if (!Cid) {
            return res.status(400).json({
                message: "ID de la consulta no proporcionado"
            });
        }
        const consulta = yield consulta_1.Consulta.findByPk(Cid);
        if (!consulta) {
            return res.status(404).json({
                message: "Consulta no encontrada"
            });
        }
        if (consulta.abierto === false) {
            return res.status(400).json({
                message: "La consulta ya está cerrada"
            });
        }
        yield consulta.update({
            abierto: false,
            motivo_cierre: motivo_cierre || "Consulta cerrada",
            fecha_cierre: new Date(),
            cerrado_por: Uid
        });
        return res.status(200).json({
            message: "Consulta cerrada correctamente",
            data: consulta
        });
    }
    catch (error) {
        console.error('Error al cerrar la consulta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({
            message: 'Error interno del servidor al cerrar la consulta',
            error: errorMessage
        });
    }
});
exports.cerrarConsulta = cerrarConsulta;
