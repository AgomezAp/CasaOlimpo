import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.ENCRYPTION_KEY;

if (!SECRET_KEY) {
  throw new Error('ERROR DE SEGURIDAD: No se ha definido ENCRYPTION_KEY en las variables de entorno.');
}

/**
 * Cifra un texto usando AES
 */
export const encryptData = (text: string): string => {
  try {
    if (!text) return '';
    // Asegúrate de que sea una cadena de texto
    const textString = String(text);
    return CryptoJS.AES.encrypt(textString, SECRET_KEY).toString();
  } catch (error) {
    console.error("Error al encriptar datos:", error);
    return '';
  }
};

/**
 * Descifra un texto cifrado con AES
 */
export const decryptData = (ciphertext: string): string => {
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
    
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Error al desencriptar datos:", error);
    // Devolver cadena vacía en caso de error, no mostrar información sensible
    return '';
  }
};