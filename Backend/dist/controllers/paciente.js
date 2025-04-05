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
exports.obtenerPacientesPorDoctor = exports.actualizarDatosPaciente = exports.obtenerPacienteId = exports.obtenerPacientes = exports.crearPaciente = exports.obtenerFotoPaciente = exports.eliminarFotoPaciente = exports.actualizarFotoPaciente = exports.uploadPacienteFoto = void 0;
const paciente_1 = require("../models/paciente");
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
const encriptado_1 = require("./encriptado");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const user_1 = require("../models/user");
dotenv_1.default.config();
const pacientesStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, '../../uploads/pacientes/fotos');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        // Usar número de documento como parte del nombre para fácil identificación
        const documento = req.params.numero_documento || "temp";
        const uniqueFilename = `paciente_${documento}_${Date.now()}${ext}`;
        cb(null, uniqueFilename);
    }
});
// Filtro para solo permitir imágenes
const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Formato de archivo no válido. Solo se permiten imágenes JPEG, JPG y PNG.'), false);
    }
};
exports.uploadPacienteFoto = (0, multer_1.default)({
    storage: pacientesStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 15 * 1024 * 1024 } // Aumentar a 15MB para fotos dermatológicas originales
});
/**
 * Subir o actualizar foto de perfil del paciente
 */
const actualizarFotoPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        // Verificar que se ha subido un archivo
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }
        // Si ya tenía una foto, eliminarla
        if (paciente.foto_path) {
            const rutaAnterior = path_1.default.join(__dirname, `../../${paciente.foto_path.replace(/^\//, '')}`);
            if (fs_1.default.existsSync(rutaAnterior)) {
                fs_1.default.unlinkSync(rutaAnterior);
            }
        }
        // Guardar la ruta de la nueva imagen
        const rutaRelativa = `/uploads/pacientes/fotos/${req.file.filename}`;
        yield paciente.update({
            foto_path: rutaRelativa
        });
        return res.status(200).json({
            message: 'Foto del paciente actualizada correctamente',
            data: {
                foto_path: rutaRelativa
            }
        });
    }
    catch (error) {
        console.error('Error actualizando foto del paciente:', error);
        if (req.file) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch (e) { /* No hacer nada */ }
        }
        return res.status(500).json({
            message: 'Error actualizando la foto del paciente',
            error: error.message
        });
    }
});
exports.actualizarFotoPaciente = actualizarFotoPaciente;
/**
 * Eliminar foto del paciente
 */
const eliminarFotoPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        // Verificar que tiene una foto
        if (!paciente.foto_path) {
            return res.status(400).json({ message: 'El paciente no tiene foto registrada' });
        }
        // Eliminar archivo físico
        const rutaImagen = path_1.default.join(__dirname, `../../${paciente.foto_path.replace(/^\//, '')}`);
        if (fs_1.default.existsSync(rutaImagen)) {
            fs_1.default.unlinkSync(rutaImagen);
        }
        // Actualizar paciente
        yield paciente.update({
            foto_path: null
        });
        return res.status(200).json({
            message: 'Foto del paciente eliminada correctamente'
        });
    }
    catch (error) {
        console.error('Error eliminando foto del paciente:', error);
        return res.status(500).json({
            message: 'Error eliminando la foto del paciente',
            error: error.message
        });
    }
});
exports.eliminarFotoPaciente = eliminarFotoPaciente;
/**
 * Obtener la foto del paciente
 * Nota: Esta función es opcional ya que puedes acceder directamente
 * a la imagen a través de la URL pública
 */
const obtenerFotoPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento, {
            attributes: ['numero_documento', 'nombre', 'apellidos', 'foto_path']
        });
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        if (!paciente.foto_path) {
            return res.status(404).json({ message: 'El paciente no tiene foto registrada' });
        }
        // Construir la ruta absoluta del archivo en el servidor
        const rutaAbsoluta = path_1.default.join(__dirname, '../../', paciente.foto_path.replace(/^\//, ''));
        // Verificar si el archivo existe
        if (!fs_1.default.existsSync(rutaAbsoluta)) {
            return res.status(404).json({
                message: 'Archivo de imagen no encontrado en el servidor',
                ruta: rutaAbsoluta
            });
        }
        // Obtener el tipo MIME basado en la extensión
        const extension = path_1.default.extname(rutaAbsoluta).toLowerCase();
        let contentType = 'image/jpeg'; // Valor por defecto
        if (extension === '.png') {
            contentType = 'image/png';
        }
        else if (extension === '.jpg' || extension === '.jpeg') {
            contentType = 'image/jpeg';
        }
        // Configurar los headers para la imagen
        res.setHeader('Content-Type', contentType);
        // Enviar el archivo directamente como respuesta
        return res.sendFile(rutaAbsoluta);
    }
    catch (error) {
        console.error('Error obteniendo foto del paciente:', error);
        return res.status(500).json({
            message: 'Error obteniendo la foto del paciente',
            error: error.message
        });
    }
});
exports.obtenerFotoPaciente = obtenerFotoPaciente;
const crearPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellidos, fecha_nacimiento, sexo, ciudad_nacimiento, edad, tipo_documento, numero_documento, ciudad_expedicion, ciudad_domicilio, barrio, direccion_domicilio, telefono, email, celular, ocupacion, estado_civil, eps, tipo_afiliacion, grupo_sanguineo, rh, alergias, antecedentes, antecedentes_familiares } = req.body;
    const { Uid } = req.body;
    try {
        // Verificar que el doctor existe y tiene el rol correcto
        const doctor = yield user_1.User.findByPk(Uid);
        if (!doctor || doctor.rol !== 'Doctor') {
            return res.status(400).json({ message: 'Usuario no autorizado para crear pacientes' });
        }
        // Verificar si el paciente ya existe
        const paciente = yield paciente_1.Paciente.findOne({ where: { numero_documento } });
        if (paciente) {
            return res.status(400).json({
                message: "El paciente ya existe"
            });
        }
        // Validar formato de fecha
        const fechaFormateada = (0, dayjs_1.default)(fecha_nacimiento, "YYYY-MM-DD", true);
        if (!fechaFormateada.isValid()) {
            return res.status(400).json({
                message: "El formato de la fecha de nacimiento es inválido. Debe ser YYYY-MM-DD.",
            });
        }
        // Encriptar datos sensibles
        const direccionCifrada = (0, encriptado_1.encryptData)(direccion_domicilio);
        const alergiasCifradas = (0, encriptado_1.encryptData)(alergias);
        const antecedentesCifrados = (0, encriptado_1.encryptData)(antecedentes);
        const antecedentesFamiliaresCifrados = (0, encriptado_1.encryptData)(antecedentes_familiares);
        // Crear el paciente incluyendo el Uid del doctor
        const nuevoPaciente = yield paciente_1.Paciente.create({
            Uid, // Aquí estaba faltando incluir el Uid
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
        });
        return res.status(201).json({
            message: "Paciente registrado correctamente",
            data: Object.assign(Object.assign({}, nuevoPaciente.toJSON()), { doctor: {
                    Uid: doctor.Uid,
                    nombre: doctor.nombre
                } }),
        });
    }
    catch (err) {
        console.error("Error registrando al paciente:", err);
        res.status(500).json({
            message: "Error registrando al paciente",
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
const obtenerPacientesPorDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Uid } = req.params;
        // Verificar que el doctor existe
        const doctor = yield user_1.User.findByPk(Uid);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor no encontrado' });
        }
        // Verificar que el usuario es un doctor
        if (doctor.rol !== 'Doctor') {
            return res.status(400).json({ message: 'El usuario no es un doctor' });
        }
        // Obtener todos los pacientes asignados al doctor
        const pacientes = yield paciente_1.Paciente.findAll({
            where: { Uid },
            order: [['nombre', 'ASC'], ['apellidos', 'ASC']]
        });
        return res.status(200).json({
            message: 'Pacientes obtenidos correctamente',
            data: {
                doctor: doctor.nombre,
                total_pacientes: pacientes.length,
                pacientes
            }
        });
    }
    catch (error) {
        console.error('Error obteniendo pacientes por doctor:', error);
        return res.status(500).json({
            message: 'Error obteniendo pacientes por doctor',
            error: error.message
        });
    }
});
exports.obtenerPacientesPorDoctor = obtenerPacientesPorDoctor;
