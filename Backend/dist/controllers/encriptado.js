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
    try {
        if (!text)
            return '';
        // Asegúrate de que sea una cadena de texto
        const textString = String(text);
        return crypto_js_1.default.AES.encrypt(textString, SECRET_KEY).toString();
    }
    catch (error) {
        console.error("Error al encriptar datos:", error);
        return '';
    }
};
exports.encryptData = encryptData;
/**
 * Descifra un texto cifrado con AES
 */
const decryptData = (ciphertext) => {
    try {
        // Si está vacío o no es una cadena, devolver vacío
        if (!ciphertext || typeof ciphertext !== 'string' || ciphertext === '') {
            return '';
        }
        // Comprobar si parece un texto cifrado por CryptoJS (debería empezar con algo como "U2Fsd...")
        if (!ciphertext.match(/^[A-Za-z0-9+/=]+$/)) {
            console.warn("Advertencia: El texto no parece estar cifrado correctamente:", ciphertext.substring(0, 20));
            return '';
        }
        const bytes = crypto_js_1.default.AES.decrypt(ciphertext, SECRET_KEY);
        return bytes.toString(crypto_js_1.default.enc.Utf8);
    }
    catch (error) {
        console.error("Error al desencriptar datos:", error);
        // Devolver cadena vacía en caso de error, no mostrar información sensible
        return '';
    }
};
exports.decryptData = decryptData;
