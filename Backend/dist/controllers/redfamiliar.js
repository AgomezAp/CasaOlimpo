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
exports.establecerResponsable = exports.eliminarMiembroRedFamiliar = exports.actualizarMiembroRedFamiliar = exports.obtenerRedFamiliar = exports.crearMiembroRedFamiliar = void 0;
const redfamiliar_1 = require("../models/redfamiliar");
const paciente_1 = require("../models/paciente");
const sequelize_1 = require("sequelize");
const encriptado_1 = require("./encriptado");
/**
 * Crea un nuevo miembro de la red familiar para un paciente
 */
const crearMiembroRedFamiliar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        const { nombre, apellido, telefono, correo, numero_documento: documento_miembro, es_responsable } = req.body;
        // Validar campos obligatorios
        if (!nombre || !apellido || !telefono || !correo || !documento_miembro) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios: nombre, apellido, telefono, correo y numero_documento"
            });
        }
        // Verificar que existe el paciente
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({
                message: "No se encontró el paciente con el número de documento proporcionado"
            });
        }
        // Calcular edad del paciente (si tiene fecha de nacimiento)
        let requiereAcompanante = false;
        if (paciente.fecha_nacimiento) {
            const fechaNacimiento = new Date(paciente.fecha_nacimiento);
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            const m = hoy.getMonth() - fechaNacimiento.getMonth();
            if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                edad--;
            }
            requiereAcompanante = edad < 18;
        }
        // Si el paciente es menor de edad y no tiene un responsable asignado, este debe ser responsable
        let esResponsable = es_responsable || false;
        if (requiereAcompanante) {
            // Verificar si ya existe algún miembro responsable
            const responsableExistente = yield redfamiliar_1.RedFamiliar.findOne({
                where: {
                    numero_documento_familiar: numero_documento,
                    es_responsable: true
                }
            });
            // Si no hay responsable y este es el primer miembro, automáticamente es responsable
            if (!responsableExistente) {
                esResponsable = true;
            }
        }
        // Crear el miembro de la red familiar
        const nuevoMiembro = yield redfamiliar_1.RedFamiliar.create({
            nombre: (0, encriptado_1.encryptData)(nombre),
            apellido: (0, encriptado_1.encryptData)(apellido),
            telefono: (0, encriptado_1.encryptData)(telefono),
            correo: (0, encriptado_1.encryptData)(correo),
            numero_documento: documento_miembro,
            numero_documento_familiar: numero_documento,
            es_responsable: esResponsable
        });
        const miembroDesencriptado = desencriptarMiembroRedFamiliar(nuevoMiembro.toJSON());
        return res.status(201).json({
            message: "Miembro de red familiar creado correctamente",
            data: miembroDesencriptado
        });
    }
    catch (error) {
        console.error("Error creando miembro de red familiar:", error);
        return res.status(500).json({
            message: "Error al crear miembro de red familiar",
            error: error.message
        });
    }
});
exports.crearMiembroRedFamiliar = crearMiembroRedFamiliar;
/**
 * Obtiene todos los miembros de la red familiar de un paciente
 */
const obtenerRedFamiliar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        // Verificar que existe el paciente
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({
                message: "No se encontró el paciente con el número de documento proporcionado"
            });
        }
        // Buscar todos los miembros de la red familiar del paciente
        const miembros = yield redfamiliar_1.RedFamiliar.findAll({
            where: { numero_documento_familiar: numero_documento },
            order: [
                ['es_responsable', 'DESC'], // Primero los responsables
                ['nombre', 'ASC'] // Luego ordenados alfabéticamente
            ]
        });
        // Desencriptar los datos de cada miembro
        const miembrosDesencriptados = miembros.map(miembro => desencriptarMiembroRedFamiliar(miembro.toJSON()));
        // Si paciente.nombre y paciente.apellidos están encriptados, desencriptarlos
        // (dependiendo de cómo esté implementado el modelo Paciente)
        const pacienteInfo = {
            numero_documento: paciente.numero_documento,
            nombre: typeof paciente.nombre === 'string' && paciente.nombre.match(/^[A-Za-z0-9+/=]+$/)
                ? (0, encriptado_1.decryptData)(paciente.nombre) : paciente.nombre,
            apellidos: typeof paciente.apellidos === 'string' && paciente.apellidos.match(/^[A-Za-z0-9+/=]+$/)
                ? (0, encriptado_1.decryptData)(paciente.apellidos) : paciente.apellidos
        };
        return res.status(200).json({
            message: "Red familiar obtenida correctamente",
            data: {
                paciente: pacienteInfo,
                miembros_red_familiar: miembrosDesencriptados
            }
        });
    }
    catch (error) {
        console.error("Error obteniendo red familiar:", error);
        return res.status(500).json({
            message: "Error al obtener red familiar",
            error: error.message
        });
    }
});
exports.obtenerRedFamiliar = obtenerRedFamiliar;
/**
 * Actualiza la información de un miembro de la red familiar
 */
const actualizarMiembroRedFamiliar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;
        // Verificar que el miembro existe
        const miembro = yield redfamiliar_1.RedFamiliar.findByPk(id);
        if (!miembro) {
            return res.status(404).json({
                message: "Miembro de red familiar no encontrado"
            });
        }
        // Si se intenta quitar la responsabilidad, verificar que no sea el único responsable
        if (miembro.es_responsable === true && datosActualizados.es_responsable === false) {
            // Verificar la edad del paciente
            const paciente = yield paciente_1.Paciente.findByPk(miembro.numero_documento_familiar);
            if (paciente && paciente.fecha_nacimiento) {
                const fechaNacimiento = new Date(paciente.fecha_nacimiento);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const m = hoy.getMonth() - fechaNacimiento.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
                // Si es menor de edad, verificar si hay otro responsable
                if (edad < 18) {
                    const otrosResponsables = yield redfamiliar_1.RedFamiliar.findOne({
                        where: {
                            numero_documento_familiar: miembro.numero_documento_familiar,
                            es_responsable: true,
                            Nid: { [sequelize_1.Op.ne]: id }
                        }
                    });
                    if (!otrosResponsables) {
                        return res.status(400).json({
                            message: "No se puede quitar la responsabilidad a este miembro porque es el único responsable legal del paciente menor de edad"
                        });
                    }
                }
            }
        }
        // Preparar datos encriptados para actualizar
        const datosEncriptados = {};
        // Lista de campos a encriptar
        const camposAEncriptar = ['nombre', 'apellido', 'telefono', 'correo'];
        // Procesar cada campo de entrada
        Object.keys(datosActualizados).forEach(campo => {
            if (camposAEncriptar.includes(campo) && datosActualizados[campo] !== undefined) {
                // Encriptar los campos sensibles
                datosEncriptados[campo] = (0, encriptado_1.encryptData)(datosActualizados[campo]);
            }
            else {
                // Mantener otros campos sin encriptar
                datosEncriptados[campo] = datosActualizados[campo];
            }
        });
        // Actualizar el miembro con datos encriptados
        yield miembro.update(datosEncriptados);
        // Obtener el miembro actualizado
        const miembroActualizado = yield redfamiliar_1.RedFamiliar.findByPk(id);
        // Verificar que existe (SOLUCIÓN AL ERROR)
        if (!miembroActualizado) {
            return res.status(404).json({
                message: "Error: No se pudo obtener el miembro actualizado"
            });
        }
        // Desencriptar para la respuesta
        const miembroDesencriptado = desencriptarMiembroRedFamiliar(miembroActualizado.toJSON());
        return res.status(200).json({
            message: "Miembro de red familiar actualizado correctamente",
            data: miembroDesencriptado
        });
    }
    catch (error) {
        console.error("Error actualizando miembro de red familiar:", error);
        return res.status(500).json({
            message: "Error al actualizar miembro de red familiar",
            error: error.message
        });
    }
});
exports.actualizarMiembroRedFamiliar = actualizarMiembroRedFamiliar;
/**
 * Elimina un miembro de la red familiar
 */
const eliminarMiembroRedFamiliar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Verificar que el miembro existe - convertir id a número
        const Nid = Number(id);
        const miembro = yield redfamiliar_1.RedFamiliar.findByPk(Nid);
        if (!miembro) {
            return res.status(404).json({
                message: "Miembro de red familiar no encontrado"
            });
        }
        // Verificar si es responsable y el paciente es menor de edad
        if (miembro.es_responsable) {
            const paciente = yield paciente_1.Paciente.findByPk(miembro.numero_documento_familiar);
            if (paciente && paciente.fecha_nacimiento) {
                const fechaNacimiento = new Date(paciente.fecha_nacimiento);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const m = hoy.getMonth() - fechaNacimiento.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
                // Si es menor de edad, verificar si hay otro responsable
                if (edad < 18) {
                    const otrosResponsables = yield redfamiliar_1.RedFamiliar.findOne({
                        where: {
                            numero_documento_familiar: miembro.numero_documento_familiar,
                            es_responsable: true,
                            Nid: { [sequelize_1.Op.ne]: Nid }
                        }
                    });
                    if (!otrosResponsables) {
                        return res.status(400).json({
                            message: "No se puede eliminar este miembro porque es el único responsable legal del paciente menor de edad"
                        });
                    }
                }
            }
        }
        // Eliminar el miembro
        yield miembro.destroy();
        return res.status(200).json({
            message: "Miembro de red familiar eliminado correctamente"
        });
    }
    catch (error) {
        console.error("Error eliminando miembro de red familiar:", error);
        return res.status(500).json({
            message: "Error al eliminar miembro de red familiar",
            error: error.message
        });
    }
});
exports.eliminarMiembroRedFamiliar = eliminarMiembroRedFamiliar;
/**
 * Establece un miembro como responsable legal del paciente
 */
const establecerResponsable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const Nid = Number(id);
        // Verificar que el miembro existe
        const miembro = yield redfamiliar_1.RedFamiliar.findByPk(Nid);
        if (!miembro) {
            return res.status(404).json({
                message: "Miembro de red familiar no encontrado"
            });
        }
        // Quitar responsabilidad a cualquier otro miembro
        yield redfamiliar_1.RedFamiliar.update({ es_responsable: false }, {
            where: {
                numero_documento_familiar: miembro.numero_documento_familiar,
                Nid: { [sequelize_1.Op.ne]: Nid }
            }
        });
        // REEMPLAZAR DESDE AQUÍ
        miembro.es_responsable = true;
        yield miembro.save();
        // Obtener miembro actualizado (para asegurar datos frescos)
        const miembroActualizado = yield redfamiliar_1.RedFamiliar.findByPk(Nid);
        // Verificar que existe
        if (!miembroActualizado) {
            return res.status(404).json({
                message: "Error: No se pudo obtener el miembro actualizado"
            });
        }
        // Desencriptar datos para la respuesta (ahora TypeScript sabe que no es null)
        const miembroDesencriptado = desencriptarMiembroRedFamiliar(miembroActualizado.toJSON());
        // HASTA AQUÍ
        return res.status(200).json({
            message: "Responsable legal establecido correctamente",
            data: miembroDesencriptado
        });
    }
    catch (error) {
        console.error("Error estableciendo responsable legal:", error);
        return res.status(500).json({
            message: "Error al establecer responsable legal",
            error: error.message
        });
    }
});
exports.establecerResponsable = establecerResponsable;
function desencriptarMiembroRedFamiliar(miembro) {
    // Si es null o undefined, retornar el mismo valor
    if (!miembro)
        return miembro;
    // Lista de campos que NO necesitan desencriptación
    const camposNoEncriptados = [
        'Nid', 'numero_documento', 'numero_documento_familiar',
        'es_responsable', 'createdAt', 'updatedAt'
    ];
    // Clonar el objeto para no modificar el original
    const miembroDesencriptado = Object.assign({}, miembro);
    // Desencriptar todos los campos excepto los que están en la lista
    Object.keys(miembroDesencriptado).forEach(campo => {
        if (!camposNoEncriptados.includes(campo) && miembroDesencriptado[campo]) {
            try {
                miembroDesencriptado[campo] = (0, encriptado_1.decryptData)(miembroDesencriptado[campo]);
            }
            catch (error) {
                console.error(`Error al desencriptar campo ${campo} en miembro de red familiar:`, error);
            }
        }
    });
    return miembroDesencriptado;
}
