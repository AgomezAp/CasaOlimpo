"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Carpeta = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Carpeta extends sequelize_1.Model {
}
exports.Carpeta = Carpeta;
Carpeta.init({
    CarpetaId: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Paciente',
            key: 'numero_documento'
        },
    },
    imagenes: {
        type: sequelize_1.DataTypes.TEXT('long'),
        allowNull: false
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: connection_1.default,
    tableName: "Consulta",
    timestamps: false,
});
