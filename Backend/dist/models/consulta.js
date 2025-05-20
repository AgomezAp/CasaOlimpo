"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consulta = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("./user");
const paciente_1 = require("./paciente");
class Consulta extends sequelize_1.Model {
}
exports.Consulta = Consulta;
Consulta.init({
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "Uid",
        },
    },
    Cid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    motivo: {
        type: sequelize_1.DataTypes.TEXT("medium"),
        allowNull: false,
    },
    enfermedad_actual: {
        type: sequelize_1.DataTypes.TEXT("medium"),
        allowNull: false,
    },
    objetivos_terapia: {
        type: sequelize_1.DataTypes.TEXT("medium"),
        allowNull: false,
    },
    historia_problema: {
        type: sequelize_1.DataTypes.TEXT("medium"),
        allowNull: false,
    },
    tipo_diagnostico: {
        type: sequelize_1.DataTypes.TEXT("medium"),
        allowNull: false,
    },
    contraindicaciones: {
        type: sequelize_1.DataTypes.TEXT("medium"),
        allowNull: false,
    },
    recomendaciones: {
        type: sequelize_1.DataTypes.TEXT("medium"),
        allowNull: false,
    },
    numero_documento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: "Paciente",
            key: "numero_documento",
        },
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: "User",
            key: "correo",
        },
    },
    consentimiento_info: {
        type: sequelize_1.DataTypes.BLOB("long"),
        allowNull: true,
    },
    consentimiento_check: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
    },
    abierto: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    sequelize: connection_1.default,
    tableName: "Consulta",
    timestamps: false,
});
Consulta.belongsTo(user_1.User, {
    foreignKey: "Uid", // This is the column in Consulta that references User
    targetKey: "Uid", // This is the column in User that is being referenced
    as: "doctor", // This is the alias for the relationship
});
// Define the relationship between Consulta and Paciente
Consulta.belongsTo(paciente_1.Paciente, {
    foreignKey: "numero_documento", // This is the column in Consulta that references Paciente
    targetKey: "numero_documento", // This is the column in Paciente that is being referenced
    as: "paciente", // This is the alias for the relationship
});
// Define the reverse relationships
user_1.User.hasMany(Consulta, {
    foreignKey: "Uid",
    as: "consultas",
});
paciente_1.Paciente.hasMany(Consulta, {
    foreignKey: "numero_documento",
    as: "consultas",
});
