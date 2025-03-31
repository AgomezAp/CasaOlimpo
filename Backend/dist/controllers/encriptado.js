"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = exports.encryptData = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.ENCRYPTION_KEY;
if (!SECRET_KEY) {
    throw new Error('ERROR DE SEGURIDAD: No se ha definido ENCRYPTION_KEY en las variables de entorno.');
}
/**
 * Cifra un texto usando AES
 */
const encryptData = (text) => {
    if (!text)
        return '';
    return crypto_js_1.default.AES.encrypt(text, SECRET_KEY).toString();
};
exports.encryptData = encryptData;
const decryptData = (ciphertext) => {
    if (!ciphertext)
        return '';
    const bytes = crypto_js_1.default.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
};
exports.decryptData = decryptData;
