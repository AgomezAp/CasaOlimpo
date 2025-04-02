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
exports.updateConsulta = exports.getConsulta = exports.nuevaConsulta = void 0;
const consulta_1 = require("../models/consulta");
const paciente_1 = require("../models/paciente");
const nuevaConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { motivo, enfermedad_actual, objetivos_terapia, historia_problema, desarrollo, plan_terapeutico, tipo_diagnostico, analisis_diagnostico, plan_tratamiento, recomendaciones, numero_documento, fecha, correo, consentimiento_info, consentimiento_check } = req.body;
        const paciente = yield paciente_1.Paciente.findAll({
            where: {
                numero_documento: numero_documento,
            },
        });
        if (!paciente) {
            return res.status(404).json({ message: "El paciente no existe", });
        }
        const nuevaConsulta = yield consulta_1.Consulta.create({
            motivo,
            enfermedad_actual,
            objetivos_terapia,
            historia_problema,
            desarrollo,
            plan_terapeutico,
            tipo_diagnostico,
            analisis_diagnostico,
            plan_tratamiento,
            recomendaciones,
            numero_documento,
            fecha,
            correo,
            consentimiento_info,
            consentimiento_check,
        });
        return res.status(201).json(nuevaConsulta);
    }
    catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.nuevaConsulta = nuevaConsulta;
const getConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Cid } = req.body;
        const consulta = yield consulta_1.Consulta.findOne({ where: Cid });
        res.status(201).json(consulta);
    }
    catch (error) {
        console.error('Error al crear la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.getConsulta = getConsulta;
const updateConsulta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Cid } = req.params;
        const updatedData = req.body;
        const consulta = yield consulta_1.Consulta.findByPk(Cid);
        if (!consulta) {
            return res.status(404).json({ message: "Consulta no encontrada" });
        }
        else if (!consulta.abierto) {
            return res.status(400).json({ message: "La consulta ya ha sido cerrada" });
        }
        yield consulta.update(updatedData);
        return res.status(200).json(consulta);
    }
    catch (error) {
        console.error('Error al actualizar la consulta:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
exports.updateConsulta = updateConsulta;
