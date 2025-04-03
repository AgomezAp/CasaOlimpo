"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerUsuarios = exports.eliminarUsuarioId = exports.reestablecerContraseña = exports.iniciarSesion = exports.registrarUsuario = void 0;
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registrarUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, contrasena, nombre, rol } = req.body;
    const emailDomain = correo.split("@")[1];
    if (emailDomain !== "casaolimpo.com") {
        return res.status(400).json({
            message: "Correo invalido",
        });
    }
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(contrasena)) {
        return res.status(400).json({
            message: "La contraseña debe tener al menos 8 caracteres, incluir al menos un número, una letra y un carácter especial.",
        });
    }
    const userOne = yield user_1.User.findOne({ where: { correo } });
    if (userOne) {
        return res.status(400).json({
            message: `El usuario con el email: ${correo} ya existe`,
        });
    }
    const saltRounds = 10;
    const contrasenaHasheada = yield bcrypt_1.default.hash(contrasena, saltRounds);
    try {
        const newUser = yield user_1.User.create({
            correo,
            contrasena: contrasenaHasheada,
            nombre,
            rol,
        });
        return res.status(201).json({
            message: "Usuario creado correctamente",
            data: newUser,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Error creando el usuario",
            error: err.message,
        });
    }
});
exports.registrarUsuario = registrarUsuario;
const iniciarSesion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, contrasena } = req.body;
    // Encripta el correo para buscarlo (igual que en el registro)
    // Busca por el correo encriptado
    const user = yield user_1.User.findOne({ where: { correo: correo } });
    if (!user) {
        return res.status(400).json({
            message: "Usuario no encontrado",
        });
    }
    // Verifica la contraseña con bcrypt
    const contrasenaValida = yield bcrypt_1.default.compare(contrasena, user.contrasena);
    if (!contrasenaValida) {
        return res.status(400).json({
            message: "Contraseña incorrecta",
        });
    }
    const token = jsonwebtoken_1.default.sign({
        Uid: user.Uid,
        correo: user.correo,
    }, process.env.SECRET_KEY || "DxVj971V5CxBQGB7hDqwOenbRbbH4mrS", {
        expiresIn: "30m",
    });
    res.json({
        msg: "Usuario logeado con éxito",
        Uid: user.Uid,
        correo: user.correo,
        nombre: user.nombre,
        rol: user.rol,
        token,
    });
});
exports.iniciarSesion = iniciarSesion;
const reestablecerContraseña = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo, contrasena } = req.body;
    try {
        const user = yield user_1.User.findOne({ where: { correo } });
        if (!user) {
            return res.status(400).json({ msg: "El correo:" + correo + " no existe" });
        }
        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(contrasena)) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 8 caracteres, incluir al menos un número, una letra y un carácter especial.",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(contrasena, 10);
        user.contrasena = hashedPassword;
        yield user.save();
        return res.status(200).json({ msg: "Contraseña reestablecida con éxito" });
    }
    catch (err) {
        return res.status(500).json({ msg: "Error al reestablecer la contraseña", error: err.message });
    }
});
exports.reestablecerContraseña = reestablecerContraseña;
const eliminarUsuarioId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Uid } = req.params;
    try {
        const user = yield user_1.User.findByPk(Uid);
        if (!user) {
            return res.status(400).json({ msg: "El usuario no existe" });
        }
        yield user.destroy();
        return res.status(200).json({ msg: "Usuario eliminado con éxito" });
    }
    catch (err) {
        return res.status(500).json({ msg: "Error al eliminar el usuario", error: err.message });
    }
});
exports.eliminarUsuarioId = eliminarUsuarioId;
const obtenerUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield user_1.User.findAll();
        return res.status(200).json({
            message: "Usuarios obtenidos con éxito",
            data: usuarios,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Error al obtener los usuarios",
            error: err.message,
        });
    }
});
exports.obtenerUsuarios = obtenerUsuarios;
