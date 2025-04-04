"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receta = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
const paciente_1 = require("./paciente");
class Receta extends sequelize_1.Model {
}
exports.Receta = Receta;
Receta.init({
    RecetaId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "Uid",
        },
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Paciente",
            key: "numero_documento",
        },
    },
    anotaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    medicamentos: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    instrucciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    duracion_tratamiento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    diagnostico: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    observaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    fecha_emision: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("ACTIVA", "COMPLETADA", "CADUCADA"),
        allowNull: false,
        defaultValue: "ACTIVA",
    },
    editada: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: connection_1.default,
    tableName: "Receta",
    timestamps: false,
});
Receta.belongsTo(user_1.User, { foreignKey: "Uid", as: "doctor" });
Receta.belongsTo(paciente_1.Paciente, { foreignKey: "numero_documento", as: "paciente" });
