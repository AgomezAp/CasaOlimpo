import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.ENCRYPTION_KEY ;
if (!SECRET_KEY) {
    throw new Error('ERROR DE SEGURIDAD: No se ha definido ENCRYPTION_KEY en las variables de entorno.');
  }
  
/**
 * Cifra un texto usando AES
 */
export const encryptData = (text: string): string => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string): string => {
  if (!ciphertext) return '';
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};