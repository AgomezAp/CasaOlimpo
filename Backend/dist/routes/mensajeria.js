"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mensajeria_1 = require("../controllers/mensajeria");
const router = (0, express_1.Router)();
router.post("/api/mensajeria/felicitaciones", mensajeria_1.enviarMensaje);
router.get("/api/mensajeria/obtenerCumple", mensajeria_1.obtenerFecha);
exports.default = router;
