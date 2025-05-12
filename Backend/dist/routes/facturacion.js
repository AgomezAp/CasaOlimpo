"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturacion_1 = require("../controllers/facturacion");
const validateToken_1 = __importDefault(require("./validateToken"));
const router = (0, express_1.Router)();
router.post("/api/facturacion/crearFactura", validateToken_1.default, facturacion_1.crearFactura);
router.get("/api/facturacion/facturas", validateToken_1.default, facturacion_1.facturaById);
router.get("/api/facturacion/verFactura", validateToken_1.default, facturacion_1.verFacturas);
exports.default = router;
