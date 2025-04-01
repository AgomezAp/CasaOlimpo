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
exports.eliminarImagen = exports.subirImagen = exports.crearCarpeta = exports.obtenerCarpeta = exports.upload = void 0;
const carpeta_1 = require("../models/carpeta");
const paciente_1 = require("../models/paciente");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
// Configurar multer para almacenamiento de archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const carpetaId = req.params.CarpetaId || 'temp';
        const dir = path_1.default.join(__dirname, `../../uploads/pacientes/${carpetaId}`);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueFilename = `${Date.now()}_${(0, uuid_1.v4)().substring(0, 8)}_${file.originalname}`;
        cb(null, uniqueFilename);
    }
});
// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Formato de archivo no válido. Solo se permiten imágenes JPEG, JPG y PNG.'), false);
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // límite de 5MB
});
// Obtener carpeta de un paciente
const obtenerCarpeta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento } = req.params;
        const carpeta = yield carpeta_1.Carpeta.findOne({
            where: { numero_documento },
            include: [{ model: paciente_1.Paciente, as: 'paciente' }]
        });
        if (!carpeta) {
            return res.status(404).json({ message: 'Carpeta no encontrada' });
        }
        // Parsear metadata de imágenes
        let imagenes = [];
        try {
            imagenes = JSON.parse(carpeta.imagen_metadata);
        }
        catch (e) {
            imagenes = [];
        }
        return res.status(200).json({
            message: 'Carpeta obtenida correctamente',
            data: Object.assign(Object.assign({}, carpeta.toJSON()), { imagenes })
        });
    }
    catch (error) {
        console.error('Error obteniendo carpeta:', error);
        return res.status(500).json({
            message: 'Error obteniendo la carpeta',
            error: error.message
        });
    }
});
exports.obtenerCarpeta = obtenerCarpeta;
// Crear carpeta
const crearCarpeta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { numero_documento, descripcion } = req.body;
        // Verificar que el paciente existe
        const paciente = yield paciente_1.Paciente.findByPk(numero_documento);
        if (!paciente) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        // Verificar que no existe ya una carpeta para este paciente
        const carpetaExistente = yield carpeta_1.Carpeta.findOne({ where: { numero_documento } });
        if (carpetaExistente) {
            return res.status(400).json({ message: 'Ya existe una carpeta para este paciente' });
        }
        // Crear la carpeta
        const nuevaCarpeta = yield carpeta_1.Carpeta.create({
            numero_documento,
            descripcion,
            fecha: new Date(),
            imagen_metadata: '[]'
        });
        // Crear el directorio físico para las imágenes
        const dir = path_1.default.join(__dirname, `../../uploads/pacientes/${nuevaCarpeta.CarpetaId}`);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        return res.status(201).json({
            message: 'Carpeta creada correctamente',
            data: nuevaCarpeta
        });
    }
    catch (error) {
        console.error('Error creando carpeta:', error);
        return res.status(500).json({
            message: 'Error creando la carpeta',
            error: error.message
        });
    }
});
exports.crearCarpeta = crearCarpeta;
// Subir una imagen a una carpeta
const subirImagen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { CarpetaId } = req.params;
        const { descripcion } = req.body;
        // Verificar que la carpeta existe
        const carpeta = yield carpeta_1.Carpeta.findByPk(CarpetaId);
        if (!carpeta) {
            if (req.file)
                fs_1.default.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Carpeta no encontrada' });
        }
        // Verificar que se ha subido un archivo
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }
        // Obtener metadata actual
        let imagenes = [];
        try {
            imagenes = JSON.parse(carpeta.imagen_metadata);
        }
        catch (e) {
            imagenes = [];
        }
        // Agregar la nueva imagen
        const rutaRelativa = `/uploads/pacientes/${CarpetaId}/${req.file.filename}`;
        const nuevaImagen = {
            id: (0, uuid_1.v4)(),
            ruta: rutaRelativa,
            nombre_archivo: req.file.filename,
            descripcion: descripcion || '',
            fecha_subida: new Date().toISOString()
        };
        imagenes.push(nuevaImagen);
        // Actualizar carpeta con la nueva metadata
        yield carpeta.update({
            imagen_metadata: JSON.stringify(imagenes)
        });
        return res.status(200).json({
            message: 'Imagen subida correctamente',
            data: nuevaImagen
        });
    }
    catch (error) {
        console.error('Error subiendo imagen:', error);
        if (req.file) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch (e) { /* No hacer nada */ }
        }
        return res.status(500).json({
            message: 'Error subiendo la imagen',
            error: error.message
        });
    }
});
exports.subirImagen = subirImagen;
// Eliminar una imagen de una carpeta
const eliminarImagen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { CarpetaId, imagenId } = req.params;
        // Verificar que la carpeta existe
        const carpeta = yield carpeta_1.Carpeta.findByPk(CarpetaId);
        if (!carpeta) {
            return res.status(404).json({ message: 'Carpeta no encontrada' });
        }
        // Obtener metadata actual
        let imagenes = [];
        try {
            imagenes = JSON.parse(carpeta.imagen_metadata);
        }
        catch (e) {
            return res.status(400).json({ message: 'No hay imágenes en esta carpeta' });
        }
        // Buscar la imagen
        const imagenIndex = imagenes.findIndex((img) => img.id === imagenId);
        if (imagenIndex === -1) {
            return res.status(404).json({ message: 'Imagen no encontrada' });
        }
        const imagen = imagenes[imagenIndex];
        // Eliminar archivo físico
        const rutaAbsoluta = path_1.default.join(__dirname, `../../${imagen.ruta.replace(/^\//, '')}`);
        if (fs_1.default.existsSync(rutaAbsoluta)) {
            fs_1.default.unlinkSync(rutaAbsoluta);
        }
        // Eliminar de metadata
        imagenes.splice(imagenIndex, 1);
        // Actualizar carpeta
        yield carpeta.update({
            imagen_metadata: JSON.stringify(imagenes)
        });
        return res.status(200).json({
            message: 'Imagen eliminada correctamente'
        });
    }
    catch (error) {
        console.error('Error eliminando imagen:', error);
        return res.status(500).json({
            message: 'Error eliminando la imagen',
            error: error.message
        });
    }
});
exports.eliminarImagen = eliminarImagen;
