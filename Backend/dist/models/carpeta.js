"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Carpeta = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const paciente_1 = require("./paciente");
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
    tableName: "Carpeta",
    timestamps: false,
});
Carpeta.belongsTo(paciente_1.Paciente, { foreignKey: 'numero_documento', as: 'paciente' });
paciente_1.Paciente.hasOne(Carpeta, { foreignKey: 'numero_documento', as: 'Carpeta' });
