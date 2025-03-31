"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedFamiliar = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const paciente_1 = require("./paciente");
class RedFamiliar extends sequelize_1.Model {
}
exports.RedFamiliar = RedFamiliar;
RedFamiliar.init({
    Nid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    apellido: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    correo: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    numero_documento_familiar: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Paciente',
            key: 'numero_documento'
        }
    },
}, {
    sequelize: connection_1.default,
    tableName: "RedFamiliar",
    timestamps: false,
});
RedFamiliar.belongsTo(paciente_1.Paciente, { foreignKey: 'numero_documento_familiar', as: 'paciente' });
//Paciente.hasMany(RedFamiliar, { foreignKey: 'numero_documento_familiar', as: 'redfamiliar' })
