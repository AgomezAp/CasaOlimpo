"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Paciente extends sequelize_1.Model {
}
exports.Paciente = Paciente;
Paciente.init({
    Pid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    apellidos: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    fecha_nacimiento: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    sexo: {
        type: sequelize_1.DataTypes.ENUM('Masculino', 'Femenino', 'Otro'),
        allowNull: false
    },
    ciudad_nacimiento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    edad: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    tipo_documento: {
        type: sequelize_1.DataTypes.ENUM('Cedula', 'Tarjeta de identidad', 'Cedula de extranjeria', 'Pasaporte'),
        allowNull: false
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    ciudad_expedicion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    ciudad_domicilio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    barrio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    direccion_domicilio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    celular: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    ocupacion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    estado_civil: {
        type: sequelize_1.DataTypes.ENUM('Soltero', 'Casado', 'Divorciado', 'Viudo'),
        allowNull: false
    },
    eps: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    tipo_afiliacion: {
        type: sequelize_1.DataTypes.ENUM('Contributivo', 'Subsidiado', 'Vinculado', 'Particular'),
        allowNull: false
    },
    grupo_sanguineo: {
        type: sequelize_1.DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: false
    },
    rh: {
        type: sequelize_1.DataTypes.ENUM('+', '-'),
        allowNull: false
    },
    alergias: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    antecedentes: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    antecedentes_familiares: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    consentimiento_info: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
}, {
    sequelize: connection_1.default,
    tableName: "Paciente",
    timestamps: false,
});
