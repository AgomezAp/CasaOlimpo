"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Descuento = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class Descuento extends sequelize_1.Model {
}
exports.Descuento = Descuento;
Descuento.init({
    Did: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, // Agrega esta línea
    },
    motivo_descuento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fecha_inicio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    fecha_fin: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    porcentaje: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: connection_1.default,
    tableName: "Descuento",
    timestamps: false,
});
