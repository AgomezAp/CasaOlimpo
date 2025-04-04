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
exports.obtenerRecetasActivas = exports.completarReceta = exports.obtenerRecetasPorPaciente = exports.editarReceta = exports.crearReceta = exports.obtenerRecetas = void 0;
const receta_1 = require("../models/receta");
const paciente_1 = require("../models/paciente");
const dayjs_1 = __importDefault(require("dayjs"));
const user_1 = require("../models/user");
// Obtener todas las recetas
const obtenerRecetas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recetas = yield receta_1.Receta.findAll({
            include: [
                {
                    model: user_1.User,
                    as: 'doctor',
                    attributes: ['Uid', 'nombre', 'rol']
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
const crearReceta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { medicamentos, instrucciones, duracion_tratamiento, diagnostico, observaciones, anotaciones, Uid // Recibir el Uid directamente del body por ahora
         } = req.body;
        // Obtener número de documento desde los parámetros de la URL
        const { numero_documento } = req.params;
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        // Verificar que la consulta existe (si se proporciona)
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
                    observaciones: receta.observaciones
                        ? `${receta.observaciones}\n[AUTO] Completada al crear nueva receta el ${new Date().toISOString()}`
                        : `[AUTO] Completada al crear nueva receta el ${new Date().toISOString()}`
                });
            })));
        }
        // Crear la nueva receta con Uid temporal si no se proporciona
        const nuevaReceta = yield receta_1.Receta.create({
            Uid: Uid || 1, // Usar 1 como Uid temporal si no se proporciona
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
const obtenerRecetasPorPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        const recetas = yield receta_1.Receta.findAll({
            where: { numero_documento },
            include: [
                {
                    model: user_1.User,
                    as: 'doctor',
                    attributes: ['Uid', 'nombre', 'rol']
                }
            ],
            order: [['fecha_emision', 'DESC']]
        });
        return res.status(200).json({
            message: 'Recetas del paciente obtenidas correctamente',
            data: recetas
        });
    }
    catch (error) {
        console.error('Error obteniendo recetas del paciente:', error);
        return res.status(500).json({
            message: 'Error obteniendo recetas del paciente',
            error: error.message
        });
    }
});
exports.obtenerRecetasPorPaciente = obtenerRecetasPorPaciente;
// Método adicional para completar manualmente una receta
const completarReceta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { RecetaId } = req.params;
        const { motivo } = req.body;
        // Buscar la receta
        const receta = yield receta_1.Receta.findByPk(RecetaId);
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
// Método para obtener recetas activas de un paciente
// Obtener recetas activas
const obtenerRecetasActivas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        const recetas = yield receta_1.Receta.findAll({
            where: {
                numero_documento,
                estado: 'ACTIVA'
            },
            include: [
                {
                    model: user_1.User,
                    as: 'doctor',
                    attributes: ['Uid', 'nombre', 'rol']
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
