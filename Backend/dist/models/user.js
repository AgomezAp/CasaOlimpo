"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../database/connection"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    Uid: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    contrasena: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: connection_1.default,
    tableName: "User",
    timestamps: false,
});
