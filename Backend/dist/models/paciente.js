"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paciente = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
class Paciente extends sequelize_1.Model {
}
exports.Paciente = Paciente;
Paciente.init({
    Pid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'Uid'
        }
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
        allowNull: true,
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
        type: sequelize_1.DataTypes.ENUM('Cedula', 'Tarjeta de identidad', 'Cedula de extranjeria', 'Pasaporte', 'Otro'),
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
        type: sequelize_1.DataTypes.ENUM('Soltero', 'Casado', 'Divorciado', 'Viudo', 'Union libre'),
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
        type: sequelize_1.DataTypes.ENUM('A', 'B', 'AB', 'O'),
        allowNull: true
    },
    rh: {
        type: sequelize_1.DataTypes.ENUM('+', '-'),
        allowNull: false
    },
    alergias: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false
    },
    antecedentes: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false
    },
    antecedentes_familiares: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false
    },
    foto_path: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true
    },
}, {
    sequelize: connection_1.default,
    tableName: "Paciente",
    timestamps: false,
});
Paciente.belongsTo(user_1.User, {
    foreignKey: 'Uid',
    as: 'doctor'
});
// Asociación inversa: Un doctor puede tener muchos pacientes
user_1.User.hasMany(Paciente, {
    foreignKey: 'Uid',
    as: 'pacientes'
});
