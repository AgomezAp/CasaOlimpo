"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carpeta_1 = require("../controllers/carpeta");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
// Ruta para obtener carpeta por número de documento
router.get('/api/carpeta/consultar/:numero_documento', validateToken_1.default, carpeta_1.obtenerCarpeta);
// Ruta para crear una nueva carpeta
router.post('/api/carpeta/crear', validateToken_1.default, carpeta_1.crearCarpeta);
// Ruta para subir una imagen a una carpeta específica
router.post('/api/carpeta/imagen/:CarpetaId', validateToken_1.default, [carpeta_1.upload.single('imagen')], carpeta_1.subirImagen);
// Ruta para eliminar una imagen específica de una carpeta
router.delete('/api/carpeta/imagen/:CarpetaId/:imagenId', validateToken_1.default, carpeta_1.eliminarImagen);
exports.default = router;
