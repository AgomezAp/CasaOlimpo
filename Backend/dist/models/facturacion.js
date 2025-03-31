"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factura = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const paciente_1 = require("./paciente");
class Factura extends sequelize_1.Model {
}
exports.Factura = Factura;
Factura.init({
    Fid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, // Asegúrate de incluir esta línea
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Paciente',
            key: 'numero_documento'
        },
    },
    tipo_pago: {
        type: sequelize_1.DataTypes.ENUM('Efectivo', 'Tarjeta Débito', 'Tarjeta Crédito', 'Transferencia'),
        allowNull: false,
    },
    total: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: connection_1.default,
    tableName: "Factura",
    timestamps: false,
});
Factura.belongsTo(paciente_1.Paciente, { foreignKey: 'numero_documento', as: 'paciente' });
paciente_1.Paciente.hasMany(Factura, { foreignKey: 'numero_documento', as: 'facturas' });
