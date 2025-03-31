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
exports.crearPaciente = void 0;
const paciente_1 = require("../models/paciente");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || "10");
const crearPaciente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, apellidos, fecha_nacimiento, sexo, ciudad_nacimiento, edad, tipo_documento, numero_documento, ciudad_expedicion, ciudad_domicilio, barrio, direccion_domicilio, telefono, email, celular, ocupacion, estado_civil, eps, tipo_afiliacion, grupo_sanguineo, rh, alergias, antecedentes, antecedentes_familiares, consentimiento_info } = req.body;
    try {
        const paciente = yield paciente_1.Paciente.findOne({ where: { numero_documento } });
        if (paciente) {
            return res.status(400).json({
                message: "El paciente ya existe"
            });
        }
        const encryptedData = {
            nombre: yield bcrypt_1.default.hash(nombre, saltRounds),
            apellidos: yield bcrypt_1.default.hash(apellidos, saltRounds),
            fecha_nacimiento: yield bcrypt_1.default.hash(fecha_nacimiento, saltRounds),
            sexo: yield bcrypt_1.default.hash(sexo, saltRounds),
            ciudad_nacimiento: yield bcrypt_1.default.hash(ciudad_nacimiento, saltRounds),
            edad: yield bcrypt_1.default.hash(edad.toString(), saltRounds),
            tipo_documento: yield bcrypt_1.default.hash(tipo_documento, saltRounds),
            numero_documento: yield bcrypt_1.default.hash(numero_documento, saltRounds),
            ciudad_expedicion: yield bcrypt_1.default.hash(ciudad_expedicion, saltRounds),
            ciudad_domicilio: yield bcrypt_1.default.hash(ciudad_domicilio, saltRounds),
            barrio: yield bcrypt_1.default.hash(barrio, saltRounds),
            direccion_domicilio: yield bcrypt_1.default.hash(direccion_domicilio, saltRounds),
            telefono: yield bcrypt_1.default.hash(telefono, saltRounds),
            email: yield bcrypt_1.default.hash(email, saltRounds),
            celular: yield bcrypt_1.default.hash(celular, saltRounds),
            ocupacion: yield bcrypt_1.default.hash(ocupacion, saltRounds),
            estado_civil: yield bcrypt_1.default.hash(estado_civil, saltRounds),
            eps: yield bcrypt_1.default.hash(eps, saltRounds),
            tipo_afiliacion: yield bcrypt_1.default.hash(tipo_afiliacion, saltRounds),
            grupo_sanguineo: yield bcrypt_1.default.hash(grupo_sanguineo, saltRounds),
            rh: yield bcrypt_1.default.hash(rh, saltRounds),
            alergias: yield bcrypt_1.default.hash(alergias, saltRounds),
            antecedentes: yield bcrypt_1.default.hash(antecedentes, saltRounds),
            antecedentes_familiares: yield bcrypt_1.default.hash(antecedentes_familiares, saltRounds),
            consentimiento_info: yield bcrypt_1.default.hash(consentimiento_info, saltRounds),
        };
        Object.assign(req.body, encryptedData);
        const nuevoPaciente = yield paciente_1.Paciente.create({
            nombre,
            apellidos,
            fecha_nacimiento,
            sexo,
            ciudad_nacimiento,
            edad,
            tipo_documento,
            numero_documento,
            ciudad_expedicion,
            ciudad_domicilio,
            barrio,
            direccion_domicilio,
            telefono,
            email,
            celular,
            ocupacion,
            estado_civil,
            eps,
            tipo_afiliacion,
            grupo_sanguineo,
            rh,
            alergias,
            antecedentes,
            antecedentes_familiares,
            consentimiento_info
        });
        return res.status(201).json({
            message: "Cita creada correctamente",
            data: nuevoPaciente,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error creando la cita",
            error: err.message,
        });
    }
});
exports.crearPaciente = crearPaciente;
