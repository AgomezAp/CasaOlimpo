import { Paciente } from "../models/paciente";
import { Request, Response } from "express";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { decryptData, encryptData } from "./encriptado";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { NextFunction } from "express";
import { User } from "../models/user";
import sequelize from "../database/connection";
import { Consulta } from "../models/consulta";
import { Carpeta } from "../models/carpeta";
import { Agenda } from "../models/agenda";
import { Op } from "sequelize";

dotenv.config();

const pacientesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/pacientes/fotos");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Usar número de documento como parte del nombre para fácil identificación
    const documento = req.params.numero_documento || "temp";
    const uniqueFilename = `paciente_${documento}_${Date.now()}${ext}`;
    cb(null, uniqueFilename);
  },
});

// Filtro para solo permitir imágenes
const imageFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Formato de archivo no válido. Solo se permiten imágenes JPEG, JPG y PNG."
      ),
      false
    );
  }
};

export const uploadPacienteFoto = multer({
  storage: pacientesStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // Aumentar a 15MB para fotos dermatológicas originales
});

/**
 * Subir o actualizar foto de perfil del paciente
 */
export const actualizarFotoPaciente = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { numero_documento } = req.params;

    // Verificar que el paciente existe
    const paciente = await Paciente.findByPk(numero_documento);
    if (!paciente) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Verificar que se ha subido un archivo
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo" });
    }

    // Si ya tenía una foto, eliminarla
    if (paciente.foto_path) {
      const rutaAnterior = path.join(
        __dirname,
        `../../${paciente.foto_path.replace(/^\//, "")}`
      );
      if (fs.existsSync(rutaAnterior)) {
        fs.unlinkSync(rutaAnterior);
      }
    }

    // Guardar la ruta de la nueva imagen
    const rutaRelativa = `/uploads/pacientes/fotos/${req.file.filename}`;

    await paciente.update({
      foto_path: rutaRelativa,
    });

    return res.status(200).json({
      message: "Foto del paciente actualizada correctamente",
      data: {
        foto_path: rutaRelativa,
      },
    });
  } catch (error: any) {
    console.error("Error actualizando foto del paciente:", error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        /* No hacer nada */
      }
    }
    return res.status(500).json({
      message: "Error actualizando la foto del paciente",
      error: error.message,
    });
  }
};

/**
 * Eliminar foto del paciente
 */
export const eliminarFotoPaciente = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { numero_documento } = req.params;

    // Verificar que el paciente existe
    const paciente = await Paciente.findByPk(numero_documento);
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Verificar que tiene una foto
    if (!paciente.foto_path) {
      return res
        .status(400)
        .json({ message: "El paciente no tiene foto registrada" });
    }

    // Eliminar archivo físico
    const rutaImagen = path.join(
      __dirname,
      `../../${paciente.foto_path.replace(/^\//, "")}`
    );
    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen);
    }

    // Actualizar paciente
    await paciente.update({
      foto_path: null,
    });

    return res.status(200).json({
      message: "Foto del paciente eliminada correctamente",
    });
  } catch (error: any) {
    console.error("Error eliminando foto del paciente:", error);
    return res.status(500).json({
      message: "Error eliminando la foto del paciente",
      error: error.message,
    });
  }
};

/**
 * Obtener la foto del paciente
 * Nota: Esta función es opcional ya que puedes acceder directamente
 * a la imagen a través de la URL pública
 */
export const obtenerFotoPaciente = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { numero_documento } = req.params;

    const paciente = await Paciente.findByPk(numero_documento, {
      attributes: ["numero_documento", "nombre", "apellidos", "foto_path"],
    });

    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    if (!paciente.foto_path) {
      return res
        .status(404)
        .json({ message: "El paciente no tiene foto registrada" });
    }

    // Construir la ruta absoluta del archivo en el servidor
    const rutaAbsoluta = path.join(
      __dirname,
      "../../",
      paciente.foto_path.replace(/^\//, "")
    );

    // Verificar si el archivo existe
    if (!fs.existsSync(rutaAbsoluta)) {
      return res.status(404).json({
        message: "Archivo de imagen no encontrado en el servidor",
        ruta: rutaAbsoluta,
      });
    }

    // Obtener el tipo MIME basado en la extensión
    const extension = path.extname(rutaAbsoluta).toLowerCase();
    let contentType = "image/jpeg"; // Valor por defecto

    if (extension === ".png") {
      contentType = "image/png";
    } else if (extension === ".jpg" || extension === ".jpeg") {
      contentType = "image/jpeg";
    }

    // Configurar los headers para la imagen
    res.setHeader("Content-Type", contentType);

    // Enviar el archivo directamente como respuesta
    return res.sendFile(rutaAbsoluta);
  } catch (error: any) {
    console.error("Error obteniendo foto del paciente:", error);
    return res.status(500).json({
      message: "Error obteniendo la foto del paciente",
      error: error.message,
    });
  }
};

export const crearPaciente = async (
  req: Request,
  res: Response
): Promise<any> => {
  const {
    nombre,
    apellidos,
    fecha_nacimiento,
    sexo,
    ciudad_nacimiento,
    edad,
    tipo_documento,
    numero_documento,
    ciudad_expedicion,
    ciudad_domicilio,
    barrio,
    direccion_domicilio,
    telefono,
    email,
    celular,
    ocupacion,
    estado_civil,
    eps,
    tipo_afiliacion,
    grupo_sanguineo,
    rh,
    alergias,
    antecedentes,
    antecedentes_familiares,
  } = req.body;
  const { Uid } = req.body;

  try {
    // Verificar que el doctor existe y tiene el rol correcto
    const doctor = await User.findByPk(Uid);
    if (!doctor || doctor.rol !== "Doctor") {
      return res
        .status(400)
        .json({ message: "Usuario no autorizado para crear pacientes" });
    }

    // Verificar si el paciente ya existe
    const paciente = await Paciente.findOne({ where: { numero_documento } });
    if (paciente) {
      return res.status(400).json({
        message: "El paciente ya existe",
      });
    }

    // Validar formato de fecha
    const fechaFormateada = dayjs(fecha_nacimiento, "YYYY-MM-DD", true);
    if (!fechaFormateada.isValid()) {
      return res.status(400).json({
        message:
          "El formato de la fecha de nacimiento es inválido. Debe ser YYYY-MM-DD.",
      });
    }

    // Encriptar datos sensibles
    const direccionCifrada = encryptData(direccion_domicilio);
    const alergiasCifradas = encryptData(alergias);
    const antecedentesCifrados = encryptData(antecedentes);
    const antecedentesFamiliaresCifrados = encryptData(antecedentes_familiares);

    // Crear el paciente incluyendo el Uid del doctor
    const nuevoPaciente = await Paciente.create({
      Uid,
      nombre: encryptData(nombre),
      apellidos: encryptData(apellidos),
      fecha_nacimiento: fechaFormateada.toDate(),
      sexo,
      ciudad_nacimiento: encryptData(ciudad_nacimiento),
      edad: encryptData(edad),
      tipo_documento,
      numero_documento,
      ciudad_expedicion: encryptData(ciudad_expedicion),
      ciudad_domicilio: encryptData(ciudad_domicilio),
      barrio: encryptData(barrio),
      direccion_domicilio: direccionCifrada,
      telefono: encryptData(telefono),
      email: encryptData(email),
      celular: encryptData(celular),
      ocupacion: encryptData(ocupacion),
      estado_civil,
      eps: encryptData(eps),
      tipo_afiliacion,
      grupo_sanguineo,
      rh,
      alergias: alergiasCifradas,
      antecedentes: antecedentesCifrados,
      antecedentes_familiares: antecedentesFamiliaresCifrados,
    });

    return res.status(201).json({
      message: "Paciente registrado correctamente",
      data: {
        ...nuevoPaciente.toJSON(),
        doctor: {
          Uid: doctor.Uid,
          nombre: doctor.nombre,
        },
      },
    });
  } catch (err: any) {
    console.error("Error registrando al paciente:", err);
    res.status(500).json({
      message: "Error registrando al paciente",
      error: err.message,
    });
  }
};

export const obtenerPacientes = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const pacientes = await Paciente.findAll();

    // Usar la función auxiliar para desencriptar todos los pacientes
    const pacientesDesencriptados = pacientes.map((paciente) =>
      desencriptarPacienteCompleto(paciente.toJSON())
    );

    return res.status(200).json({
      message: "Lista de pacientes",
      data: pacientesDesencriptados,
    });
  } catch (err: any) {
    console.error("Error:", err);
    res.status(500).json({
      message: "Error obteniendo la lista de pacientes",
      error: err.message,
    });
  }
};
export const obtenerPacienteId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { numero_documento } = req.params;
  try {
    const paciente = await Paciente.findOne({ where: { numero_documento } });
    if (!paciente) {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    // Desencriptar todos los campos del paciente
    const pacienteDesencriptado = desencriptarPacienteCompleto(
      paciente.toJSON()
    );

    return res.status(200).json({
      message: "Paciente encontrado",
      data: pacienteDesencriptado,
    });
  } catch (err: any) {
    console.error("Error al obtener paciente:", err);
    res.status(500).json({
      message: "Error obteniendo el paciente",
      error: err.message,
    });
  }
};
export const actualizarDatosPaciente = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { numero_documento } = req.params;
  const datosActualizados = req.body;

  try {
    const paciente = await Paciente.findOne({ where: { numero_documento } });
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    // Preparar objeto de actualización solo con los campos proporcionados
    const actualizaciones: any = {};

    // Procesar solo los campos que vienen en el request
    if (datosActualizados.direccion_domicilio)
      actualizaciones.direccion_domicilio = encryptData(
        datosActualizados.direccion_domicilio
      );

    // Campos normales (sin encriptar)
    [
      "edad",
      "tipo_documento",
      "ciudad_expedicion",
      "ciudad_domicilio",
      "barrio",
      "telefono",
      "email",
      "celular",
      "ocupacion",
      "estado_civil",
      "eps",
      "tipo_afiliacion",
      "consentimiento_info",
    ].forEach((campo) => {
      if (campo in datosActualizados) {
        actualizaciones[campo] = datosActualizados[campo];
      }
    });

    // Campos que requieren encriptación
    ["alergias", "antecedentes", "antecedentes_familiares"].forEach((campo) => {
      if (campo in datosActualizados) {
        actualizaciones[campo] = encryptData(datosActualizados[campo]);
      }
    });

    // Solo actualiza los campos que se proporcionaron
    await paciente.update(actualizaciones);

    return res.status(200).json({
      message: "Paciente actualizado correctamente",
    });
  } catch (err: any) {
    console.error("Error:", err);
    res.status(500).json({
      message: "Error actualizando el paciente",
      error: err.message,
    });
  }
};
export const obtenerPacientesPorDoctor = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { Uid } = req.params;

    // Verificar que el doctor existe
    const doctor = await User.findByPk(Uid);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }

    // Verificar que el usuario es un doctor
    if (doctor.rol !== "Doctor") {
      return res.status(400).json({ message: "El usuario no es un doctor" });
    }

    // Obtener todos los pacientes asignados al doctor
    const pacientes = await Paciente.findAll({
      where: { Uid },
      order: [
        ["nombre", "ASC"],
        ["apellidos", "ASC"],
      ],
    });

    // Desencriptar todos los pacientes
    const pacientesDesencriptados = pacientes.map((paciente) =>
      desencriptarPacienteCompleto(paciente.toJSON())
    );

    return res.status(200).json({
      message: "Pacientes obtenidos correctamente",
      data: {
        doctor: doctor.nombre,
        total_pacientes: pacientes.length,
        pacientes: pacientesDesencriptados,
      },
    });
  } catch (error: any) {
    console.error("Error obteniendo pacientes por doctor:", error);
    return res.status(500).json({
      message: "Error obteniendo pacientes por doctor",
      error: error.message,
    });
  }
};
/**
 * Transfiere un paciente de un doctor a otro
 */
export const transferirPaciente = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { numero_documento } = req.params;
    const { doctorOrigenId, doctorDestinoId } = req.body;

    if (!doctorOrigenId || !doctorDestinoId) {
      return res.status(400).json({
        message: "Se requieren los IDs del doctor origen y destino",
      });
    }

    const doctorOrigen = await User.findByPk(doctorOrigenId);
    if (!doctorOrigen || doctorOrigen.rol !== "Doctor") {
      return res.status(404).json({
        message: "Doctor origen no encontrado o no tiene rol de doctor",
      });
    }

    const doctorDestino = await User.findByPk(doctorDestinoId);
    if (!doctorDestino || doctorDestino.rol !== "Doctor") {
      return res.status(404).json({
        message: "Doctor destino no encontrado o no tiene rol de doctor",
      });
    }

    const paciente = await Paciente.findByPk(numero_documento);
    if (!paciente) {
      return res.status(404).json({
        message: "Paciente no encontrado",
      });
    }

    if (paciente.Uid !== doctorOrigenId) {
      return res.status(403).json({
        message: "El paciente no pertenece al doctor origen especificado",
      });
    }

    const t = await sequelize.transaction();

    try {
      // 1. Actualizar paciente
      await paciente.update(
        {
          Uid: doctorDestinoId,
          fecha_transferencia: new Date(),
          doctor_anterior: doctorOrigenId,
        },
        { transaction: t }
      );

      // 2. Transferir consultas asociadas al paciente
      // Nota: Solo cambiamos el Uid, mantenemos el historial de quién creó la consulta
      await Consulta.update(
        {
          Uid: doctorDestinoId,
        },
        {
          where: {
            numero_documento,
            abierto: false,
          },
          transaction: t,
        }
      );

      // 3. Transferir cualquier otra información relacionada (por ejemplo, carpetas)
      await Carpeta.update(
        {
          Uid: doctorDestinoId,
        },
        {
          where: {
            numero_documento,
          },
          transaction: t,
        }
      );

      // 4. Transferir citas pendientes en la agenda
      await Agenda.update(
        {
          Uid: doctorDestinoId,
        },
        {
          where: {
            numero_documento,
            fecha: { [Op.gte]: new Date() }, // Solo futuras citas
          },
          transaction: t,
        }
      );

      // Confirmar transacción
      await t.commit();

      // Desencriptar los datos del paciente para la respuesta
      const pacienteInfo = desencriptarPacienteCompleto({
        numero_documento: paciente.numero_documento,
        nombre: paciente.nombre,
        apellidos: paciente.apellidos,
      });

      return res.status(200).json({
        message: "Paciente transferido correctamente",
        data: {
          paciente: pacienteInfo,
          doctor_origen: {
            id: doctorOrigen.Uid,
            nombre: doctorOrigen.nombre,
          },
          doctor_destino: {
            id: doctorDestino.Uid,
            nombre: doctorDestino.nombre,
          },
          fecha_transferencia: new Date(),
        },
      });
    } catch (error) {
      // Si hay error, deshacer todas las operaciones
      await t.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error("Error transfiriendo paciente:", error);
    return res.status(500).json({
      message: "Error al transferir el paciente",
      error: error.message,
    });
  }
};
function desencriptarPacienteCompleto(pacienteJSON: any): any {
  // Lista de campos que NO se desencriptan
  const camposNoEncriptados = [
    "Pid",
    "numero_documento",
    "Uid",
    "foto_path",
    "fecha_nacimiento",
    "tipo_documento",
    "estado_civil",
    "tipo_afiliacion",
    "grupo_sanguineo",
    "rh",
    "sexo",
    "doctor_anterior",
    "fecha_transferencia",
    "createdAt",
    "updatedAt",
  ];

  // Clona el objeto para no modificar el original
  const pacienteDesencriptado = { ...pacienteJSON };

  // Recorre todos los campos del objeto
  Object.keys(pacienteDesencriptado).forEach((campo) => {
    // Solo desencriptar si no está en la lista de exentos y tiene valor
    if (!camposNoEncriptados.includes(campo) && pacienteDesencriptado[campo]) {
      try {
        pacienteDesencriptado[campo] = decryptData(
          pacienteDesencriptado[campo]
        );
      } catch (error) {
        console.error(`Error al desencriptar campo ${campo}:`, error);
      }
    }
  });

  return pacienteDesencriptado;
}
