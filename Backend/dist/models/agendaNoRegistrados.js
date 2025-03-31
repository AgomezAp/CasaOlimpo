"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaNoRegistrados = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
class AgendaNoRegistrados extends sequelize_1.Model {
}
exports.AgendaNoRegistrados = AgendaNoRegistrados;
AgendaNoRegistrados.init({
    ANRid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'User',
            key: 'correo'
        },
    },
    fecha_cita: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    hora_cita: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false
    },
}, {
    sequelize: connection_1.default,
    tableName: "AgendaNoRegistrados",
    timestamps: false,
});
AgendaNoRegistrados.belongsTo(user_1.User, { foreignKey: 'correo', as: 'User' });
user_1.User.hasOne(AgendaNoRegistrados, { foreignKey: 'correo', as: 'Agenda' });
