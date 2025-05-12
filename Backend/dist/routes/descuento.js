"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const descuento_1 = require("../controllers/descuento");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.post("/api/descuento/crearDescuento", validateToken_1.default, descuento_1.crearDescuento);
router.get("/api/descuento/obtenerDescuento", validateToken_1.default, descuento_1.obtenerDescuentos);
router.delete("/api/descuento/eliminarDescuento/:id", validateToken_1.default, descuento_1.eliminarDescuento);
router.put("/api/descuento/actualizarDescuento/:id", validateToken_1.default, descuento_1.editarDescuento);
exports.default = router;
