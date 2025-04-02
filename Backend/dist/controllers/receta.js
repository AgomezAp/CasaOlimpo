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
exports.obtenerRecetasActivas = exports.completarReceta = exports.editarReceta = exports.crearReceta = exports.obtenerRecetas = void 0;
const receta_1 = require("../models/receta");
const consulta_1 = require("../models/consulta");
const paciente_1 = require("../models/paciente");
const dayjs_1 = __importDefault(require("dayjs"));
const user_1 = require("../models/user");
// Obtener todas las recetas
const obtenerRecetas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recetas = yield receta_1.Receta.findAll({
            include: [
                {
                    model: consulta_1.Consulta,
                    as: 'consulta',
                    include: [{ model: paciente_1.Paciente, as: 'paciente' }]
                },
                {
                    model: user_1.User,
                    as: 'doctor',
                    attributes: ['Uid', 'nombre', 'apellido', 'especialidad']
                }
            ],
            order: [['fecha_emision', 'DESC']]
        });
        return res.status(200).json({
            message: 'Recetas obtenidas correctamente',
            data: recetas
        });
    }
    catch (error) {
        console.error('Error obteniendo recetas:', error);
        return res.status(500).json({
            message: 'Error obteniendo las recetas',
            error: error.message
        });
    }
});
exports.obtenerRecetas = obtenerRecetas;
// Crear receta (con validación de una sola receta activa)
const crearReceta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Cid, // Usando Cid en lugar de ConsultaId (basado en tu modelo)
        medicamentos, instrucciones, duracion_tratamiento, diagnostico, observaciones, anotaciones } = req.body;
        // Obtener el Uid del token (usuario autenticado)
        const Uid = req.body.usuarioAutenticado.Uid;
        // Verificar que la consulta existe
        const consulta = yield consulta_1.Consulta.findByPk(Cid);
        if (!consulta) {
            return res.status(404).json({ message: 'Consulta no encontrada' });
        }
        // Obtener el número de documento del paciente
        const numero_documento = consulta.numero_documento;
        // Buscar recetas activas para este paciente
        const recetasActivas = yield receta_1.Receta.findAll({
            where: {
                numero_documento,
                estado: 'ACTIVA'
            }
        });
        // Cambiar el estado de las recetas previas a COMPLETADA
        if (recetasActivas.length > 0) {
            yield Promise.all(recetasActivas.map((receta) => __awaiter(void 0, void 0, void 0, function* () {
                yield receta.update({
                    estado: 'COMPLETADA',
                    // Opcional: añadir un campo para registrar cuándo/por qué se completó
                    observaciones: receta.observaciones
                        ? `${receta.observaciones}\n[AUTO] Completada al crear nueva receta el ${new Date().toISOString()}`
                        : `[AUTO] Completada al crear nueva receta el ${new Date().toISOString()}`
                });
            })));
        }
        // Crear la nueva receta
        const nuevaReceta = yield receta_1.Receta.create({
            Cid, // Usar Cid en lugar de ConsultaId
            Uid, // Médico que emite la receta
            numero_documento,
            medicamentos,
            instrucciones,
            duracion_tratamiento,
            diagnostico,
            observaciones,
            anotaciones,
            fecha_emision: new Date(),
            estado: 'ACTIVA',
            editada: false
        });
        return res.status(201).json({
            message: 'Receta creada correctamente. Recetas previas marcadas como completadas.',
            data: nuevaReceta,
            recetasCompletadas: recetasActivas.length
        });
    }
    catch (error) {
        console.error('Error creando receta:', error);
        return res.status(500).json({
            message: 'Error creando la receta',
            error: error.message
        });
    }
});
exports.crearReceta = crearReceta;
// Editar receta con restricción de tiempo (48 horas)
const editarReceta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recetaId } = req.params;
        const { medicamentos, instrucciones, duracion_tratamiento, diagnostico, observaciones, anotaciones } = req.body;
        // Obtener el Uid del token (usuario autenticado)
        const Uid = req.body.usuarioAutenticado.Uid;
        // Buscar la receta
        const receta = yield receta_1.Receta.findByPk(recetaId);
        if (!receta) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        // Verificar que la receta está activa
        if (receta.estado !== 'ACTIVA') {
            return res.status(403).json({
                message: `No se puede editar la receta porque su estado es ${receta.estado}`
            });
        }
        // Verificar tiempo límite (48 horas desde emisión)
        const fechaEmision = (0, dayjs_1.default)(receta.fecha_emision);
        const ahora = (0, dayjs_1.default)();
        const horasTranscurridas = ahora.diff(fechaEmision, 'hour');
        // Restricción de 48 horas para edición
        if (horasTranscurridas > 48) {
            return res.status(403).json({
                message: 'No se puede editar la receta después de 48 horas de su emisión',
                tiempoTranscurrido: `${horasTranscurridas} horas`
            });
        }
        // Actualizar receta
        yield receta.update({
            medicamentos: medicamentos !== null && medicamentos !== void 0 ? medicamentos : receta.medicamentos,
            instrucciones: instrucciones !== null && instrucciones !== void 0 ? instrucciones : receta.instrucciones,
            duracion_tratamiento: duracion_tratamiento !== null && duracion_tratamiento !== void 0 ? duracion_tratamiento : receta.duracion_tratamiento,
            diagnostico: diagnostico !== null && diagnostico !== void 0 ? diagnostico : receta.diagnostico,
            observaciones: observaciones !== null && observaciones !== void 0 ? observaciones : receta.observaciones,
            anotaciones: anotaciones !== null && anotaciones !== void 0 ? anotaciones : receta.anotaciones,
            Uid: Uid, // Actualizar al médico que editó la receta
            editada: true
        });
        return res.status(200).json({
            message: 'Receta actualizada correctamente',
            data: receta
        });
    }
    catch (error) {
        console.error('Error actualizando receta:', error);
        return res.status(500).json({
            message: 'Error actualizando la receta',
            error: error.message
        });
    }
});
exports.editarReceta = editarReceta;
// Método adicional para completar manualmente una receta
const completarReceta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recetaId } = req.params;
        const { motivo } = req.body;
        // Buscar la receta
        const receta = yield receta_1.Receta.findByPk(recetaId);
        if (!receta) {
            return res.status(404).json({ message: 'Receta no encontrada' });
        }
        // Verificar que la receta está activa
        if (receta.estado !== 'ACTIVA') {
            return res.status(400).json({
                message: `La receta ya está ${receta.estado}`
            });
        }
        // Actualizar estado y agregar observación
        let observaciones = receta.observaciones || '';
        if (motivo) {
            observaciones += `\n[${new Date().toISOString()}] Completada: ${motivo}`;
        }
        yield receta.update({
            estado: 'COMPLETADA',
            observaciones
        });
        return res.status(200).json({
            message: 'Receta marcada como completada',
            data: receta
        });
    }
    catch (error) {
        console.error('Error completando receta:', error);
        return res.status(500).json({
            message: 'Error completando la receta',
            error: error.message
        });
    }
});
exports.completarReceta = completarReceta;
// Método para obtener recetas activas de un paciente
const obtenerRecetasActivas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        const recetas = yield receta_1.Receta.findAll({
            where: {
                numero_documento,
                estado: 'ACTIVA'
            },
            include: [
                {
                    model: consulta_1.Consulta,
                    as: 'consulta'
                },
                {
                    model: user_1.User,
                    as: 'doctor',
                    attributes: ['Uid', 'nombre', 'apellido', 'especialidad']
                }
            ],
            order: [['fecha_emision', 'DESC']]
        });
        return res.status(200).json({
            message: 'Recetas activas obtenidas correctamente',
            data: recetas
        });
    }
    catch (error) {
        console.error('Error obteniendo recetas activas:', error);
        return res.status(500).json({
            message: 'Error obteniendo recetas activas',
            error: error.message
        });
    }
});
exports.obtenerRecetasActivas = obtenerRecetasActivas;
