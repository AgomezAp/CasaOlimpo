"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mensajeria_1 = require("../controllers/mensajeria");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.post("/api/mensajeria/felicitaciones", validateToken_1.default, mensajeria_1.enviarMensaje);
router.post("/api/mensajeria/obtenerMensaje", validateToken_1.default, mensajeria_1.obtenerMensaje);
router.get("/api/mensajeria/obtenerCumple", validateToken_1.default, mensajeria_1.obtenerFecha);
router.get("/api/mensajeria/mensaje", validateToken_1.default, mensajeria_1.mensajeToFront);
router.get("/api/mensajeria/session", validateToken_1.default, mensajeria_1.verificarSesion);
router.post("/api/mensajeria/nuevaSesion", validateToken_1.default, mensajeria_1.serverwsocket);
router.delete("/api/mensajeria/eliminarSesion", validateToken_1.default, mensajeria_1.eliminarSesion);
exports.default = router;
