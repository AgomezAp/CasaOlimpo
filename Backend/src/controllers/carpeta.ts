import { Request, Response } from 'express';
import { Carpeta } from '../models/carpeta';
import { Paciente } from '../models/paciente';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configurar multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const carpetaId = req.params.CarpetaId || 'temp';
    const dir = path.join(__dirname, `../../uploads/pacientes/${carpetaId}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}_${uuidv4().substring(0, 8)}_${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Solo se permiten imágenes JPEG, JPG y PNG.'), false);
  }
};

export const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // límite de 5MB
});

// Obtener carpeta de un paciente
export const obtenerCarpeta = async (req: Request, res: Response): Promise<any> => {
  try {
    const { numero_documento } = req.params;
    
    const carpeta = await Carpeta.findOne({
      where: { numero_documento },
      include: [{ model: Paciente, as: 'paciente' }]
    });
    
    if (!carpeta) {
      return res.status(404).json({ message: 'Carpeta no encontrada' });
    }
    
    // Parsear metadata de imágenes
    let imagenes = [];
    try {
      imagenes = JSON.parse(carpeta.imagen_metadata);
    } catch (e) {
      imagenes = [];
    }
    
    return res.status(200).json({
      message: 'Carpeta obtenida correctamente',
      data: {
        ...carpeta.toJSON(),
        imagenes
      }
    });
  } catch (error: any) {
    console.error('Error obteniendo carpeta:', error);
    return res.status(500).json({
      message: 'Error obteniendo la carpeta',
      error: error.message
    });
  }
};

// Crear carpeta
export const crearCarpeta = async (req: Request, res: Response): Promise<any> => {
  try {
    const { numero_documento, descripcion } = req.body;
    
    // Verificar que el paciente existe
    const paciente = await Paciente.findByPk(numero_documento);
    if (!paciente) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }
    
    // Verificar que no existe ya una carpeta para este paciente
    const carpetaExistente = await Carpeta.findOne({ where: { numero_documento } });
    if (carpetaExistente) {
      return res.status(400).json({ message: 'Ya existe una carpeta para este paciente' });
    }
    
    // Crear la carpeta
    const nuevaCarpeta = await Carpeta.create({
      numero_documento,
      descripcion,
      fecha: new Date(),
      imagen_metadata: '[]'
    });
    
    // Crear el directorio físico para las imágenes
    const dir = path.join(__dirname, `../../uploads/pacientes/${nuevaCarpeta.CarpetaId}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    return res.status(201).json({
      message: 'Carpeta creada correctamente',
      data: nuevaCarpeta
    });
  } catch (error: any) {
    console.error('Error creando carpeta:', error);
    return res.status(500).json({
      message: 'Error creando la carpeta',
      error: error.message
    });
  }
};

// Subir una imagen a una carpeta
export const subirImagen = async (req: Request, res: Response): Promise<any> => {
  try {
    const { CarpetaId } = req.params;
    const { descripcion } = req.body;
    
    // Verificar que la carpeta existe
    const carpeta = await Carpeta.findByPk(CarpetaId);
    if (!carpeta) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Carpeta no encontrada' });
    }
    
    // Verificar que se ha subido un archivo
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }
    
    // Obtener metadata actual
    let imagenes = [];
    try {
      imagenes = JSON.parse(carpeta.imagen_metadata);
    } catch (e) {
      imagenes = [];
    }
    
    // Agregar la nueva imagen
    const rutaRelativa = `/uploads/pacientes/${CarpetaId}/${req.file.filename}`;
    
    const nuevaImagen = {
      id: uuidv4(),
      ruta: rutaRelativa,
      nombre_archivo: req.file.filename,
      descripcion: descripcion || '',
      fecha_subida: new Date().toISOString()
    };
    
    imagenes.push(nuevaImagen);
    
    // Actualizar carpeta con la nueva metadata
    await carpeta.update({
      imagen_metadata: JSON.stringify(imagenes)
    });
    
    return res.status(200).json({
      message: 'Imagen subida correctamente',
      data: nuevaImagen
    });
  } catch (error: any) {
    console.error('Error subiendo imagen:', error);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* No hacer nada */ }
    }
    return res.status(500).json({
      message: 'Error subiendo la imagen',
      error: error.message
    });
  }
};

// Eliminar una imagen de una carpeta
export const eliminarImagen = async (req: Request, res: Response): Promise<any> => {
  try {
    const { CarpetaId, imagenId } = req.params;
    
    // Verificar que la carpeta existe
    const carpeta = await Carpeta.findByPk(CarpetaId);
    if (!carpeta) {
      return res.status(404).json({ message: 'Carpeta no encontrada' });
    }
    
    // Obtener metadata actual
    let imagenes = [];
    try {
      imagenes = JSON.parse(carpeta.imagen_metadata);
    } catch (e) {
      return res.status(400).json({ message: 'No hay imágenes en esta carpeta' });
    }
    
    // Buscar la imagen
    const imagenIndex = imagenes.findIndex((img: any) => img.id === imagenId);
    if (imagenIndex === -1) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    
    const imagen = imagenes[imagenIndex];
    
    // Eliminar archivo físico
    const rutaAbsoluta = path.join(__dirname, `../../${imagen.ruta.replace(/^\//, '')}`);
    if (fs.existsSync(rutaAbsoluta)) {
      fs.unlinkSync(rutaAbsoluta);
    }
    
    // Eliminar de metadata
    imagenes.splice(imagenIndex, 1);
    
    // Actualizar carpeta
    await carpeta.update({
      imagen_metadata: JSON.stringify(imagenes)
    });
    
    return res.status(200).json({
      message: 'Imagen eliminada correctamente'
    });
  } catch (error: any) {
    console.error('Error eliminando imagen:', error);
    return res.status(500).json({
      message: 'Error eliminando la imagen',
      error: error.message
    });
  }
};