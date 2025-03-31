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
exports.actualizarDatosPaciente = exports.obtenerPacienteId = exports.obtenerPacientes = exports.crearPaciente = void 0;
const paciente_1 = require("../models/paciente");
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
const encriptado_1 = require("./encriptado");
dotenv_1.default.config();
const crearPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellidos, fecha_nacimiento, sexo, ciudad_nacimiento, edad, tipo_documento, numero_documento, ciudad_expedicion, ciudad_domicilio, barrio, direccion_domicilio, telefono, email, celular, ocupacion, estado_civil, eps, tipo_afiliacion, grupo_sanguineo, rh, alergias, antecedentes, antecedentes_familiares, consentimiento_info } = req.body;
    try {
        const paciente = yield paciente_1.Paciente.findOne({ where: { numero_documento } });
        if (paciente) {
            return res.status(400).json({
                message: "El paciente ya existe"
            });
        }
        const fechaFormateada = (0, dayjs_1.default)(fecha_nacimiento, "YYYY-MM-DD", true);
        if (!fechaFormateada.isValid()) {
            return res.status(400).json({
                message: "El formato de la fecha de nacimiento es inválido. Debe ser YYYY-MM-DD.",
            });
        }
        const direccionCifrada = (0, encriptado_1.encryptData)(direccion_domicilio);
        const alergiasCifradas = (0, encriptado_1.encryptData)(alergias);
        const antecedentesCifrados = (0, encriptado_1.encryptData)(antecedentes);
        const antecedentesFamiliaresCifrados = (0, encriptado_1.encryptData)(antecedentes_familiares);
        const nuevoPaciente = yield paciente_1.Paciente.create({
            nombre,
            apellidos,
            fecha_nacimiento: fechaFormateada.toDate(),
            sexo,
            ciudad_nacimiento,
            edad,
            tipo_documento,
            numero_documento,
            ciudad_expedicion,
            ciudad_domicilio,
            barrio,
            direccion_domicilio: direccionCifrada,
            telefono,
            email,
            celular,
            ocupacion,
            estado_civil,
            eps,
            tipo_afiliacion,
            grupo_sanguineo,
            rh,
            alergias: alergiasCifradas,
            antecedentes: antecedentesCifrados,
            antecedentes_familiares: antecedentesFamiliaresCifrados,
            consentimiento_info
        });
        return res.status(201).json({
            message: "Paciente registrado correctamente",
            data: nuevoPaciente,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error registrando al paciente ",
            error: err.message,
        });
    }
});
exports.crearPaciente = crearPaciente;
const obtenerPacientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pacientes = yield paciente_1.Paciente.findAll();
        // Descifrar los datos sensibles de cada paciente
        const pacientesDescifrados = pacientes.map(paciente => {
            const pacienteJSON = paciente.toJSON();
            // Usar try-catch para cada campo individualmente
            try {
                pacienteJSON.direccion_domicilio = (0, encriptado_1.decryptData)(pacienteJSON.direccion_domicilio);
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar dirección: ${e.message}`);
                }
                else {
                    console.error("Error al desencriptar dirección: Error desconocido");
                }
                pacienteJSON.direccion_domicilio = '';
            }
            try {
                pacienteJSON.alergias = (0, encriptado_1.decryptData)(pacienteJSON.alergias);
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar alergias: ${e.message}`);
                }
                else {
                    console.error("Error al desencriptar alergias: Error desconocido");
                }
                pacienteJSON.alergias = '';
            }
            try {
                pacienteJSON.antecedentes = (0, encriptado_1.decryptData)(pacienteJSON.antecedentes);
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar antecedentes: ${e.message}`);
                }
                else {
                    console.error("Error al desencriptar antecedentes: Error desconocido");
                }
                pacienteJSON.antecedentes = '';
            }
            try {
                pacienteJSON.antecedentes_familiares = (0, encriptado_1.decryptData)(pacienteJSON.antecedentes_familiares);
            }
            catch (e) {
                if (e instanceof Error) {
                    console.error(`Error al desencriptar antecedentes familiares: ${e.message}`);
                }
                else {
                    console.error("Error al desencriptar antecedentes familiares: Error desconocido");
                }
                pacienteJSON.antecedentes_familiares = '';
            }
            return pacienteJSON;
        });
        return res.status(200).json({
            message: "Lista de pacientes",
            data: pacientesDescifrados,
        });
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            message: "Error obteniendo la lista de pacientes",
            error: err.message,
        });
    }
});
exports.obtenerPacientes = obtenerPacientes;
const obtenerPacienteId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numero_documento } = req.params;
    try {
        const paciente = yield paciente_1.Paciente.findOne({ where: { numero_documento } });
        if (!paciente) {
            return res.status(404).json({
                message: "Paciente no encontrado",
            });
        }
        // Aquí está el problema: necesitas convertir primero a objeto plano antes de modificar
        const pacienteJSON = paciente.toJSON();
        // Desencriptar los datos sensibles
        pacienteJSON.direccion_domicilio = (0, encriptado_1.decryptData)(pacienteJSON.direccion_domicilio);
        pacienteJSON.alergias = (0, encriptado_1.decryptData)(pacienteJSON.alergias);
        pacienteJSON.antecedentes = (0, encriptado_1.decryptData)(pacienteJSON.antecedentes);
        pacienteJSON.antecedentes_familiares = (0, encriptado_1.decryptData)(pacienteJSON.antecedentes_familiares);
        return res.status(200).json({
            message: "Paciente encontrado",
            data: pacienteJSON,
        });
    }
    catch (err) {
        console.error("Error al obtener paciente:", err);
        res.status(500).json({
            message: "Error obteniendo el paciente",
            error: err.message,
        });
    }
});
exports.obtenerPacienteId = obtenerPacienteId;
const actualizarDatosPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numero_documento } = req.params;
    const datosActualizados = req.body;
    try {
        const paciente = yield paciente_1.Paciente.findOne({ where: { numero_documento } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }
        // Preparar objeto de actualización solo con los campos proporcionados
        const actualizaciones = {};
        // Procesar solo los campos que vienen en el request
        if (datosActualizados.direccion_domicilio)
            actualizaciones.direccion_domicilio = (0, encriptado_1.encryptData)(datosActualizados.direccion_domicilio);
        // Campos normales (sin encriptar)
        ['edad', 'tipo_documento', 'ciudad_expedicion', 'ciudad_domicilio',
            'barrio', 'telefono', 'email', 'celular', 'ocupacion',
            'estado_civil', 'eps', 'tipo_afiliacion', 'consentimiento_info'
        ].forEach(campo => {
            if (campo in datosActualizados) {
                actualizaciones[campo] = datosActualizados[campo];
            }
        });
        // Campos que requieren encriptación
        ['alergias', 'antecedentes', 'antecedentes_familiares'].forEach(campo => {
            if (campo in datosActualizados) {
                actualizaciones[campo] = (0, encriptado_1.encryptData)(datosActualizados[campo]);
            }
        });
        // Solo actualiza los campos que se proporcionaron
        yield paciente.update(actualizaciones);
        return res.status(200).json({
            message: "Paciente actualizado correctamente",
        });
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            message: "Error actualizando el paciente",
            error: err.message
        });
    }
});
exports.actualizarDatosPaciente = actualizarDatosPaciente;
