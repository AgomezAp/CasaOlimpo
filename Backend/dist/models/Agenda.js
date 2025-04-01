"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agenda = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
const paciente_1 = require("./paciente");
class Agenda extends sequelize_1.Model {
}
exports.Agenda = Agenda;
Agenda.init({
    Aid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: "User",
            key: "correo",
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
    fecha_cita: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    hora_cita: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("Confirmada", "Cancelada", "Pendiente"),
        defaultValue: "Pendiente",
        allowNull: false,
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: connection_1.default,
    tableName: "Agenda",
    timestamps: false,
});
Agenda.belongsTo(user_1.User, { foreignKey: "correo", targetKey: "correo", as: "doctor" });
user_1.User.hasMany(Agenda, { foreignKey: "correo", sourceKey: "correo", as: "citas" });
Agenda.belongsTo(paciente_1.Paciente, { foreignKey: "numero_documento", targetKey: "numero_documento", as: "paciente" });
paciente_1.Paciente.hasMany(Agenda, { foreignKey: "numero_documento", sourceKey: "numero_documento", as: "citas" });
