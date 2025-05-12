import { User } from "../models/user";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { decryptData, encryptData } from "./encriptado";


export const registrarUsuario = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { correo, contrasena, nombre, rol } = req.body;

  const emailDomain = correo.split("@")[1];
  if (emailDomain !== "casaolimpo.com") {
    return res.status(400).json({
      message: "Correo invalido",
    });
  }

  const passwordRegex =
    /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(contrasena)) {
    return res.status(400).json({
      message:
        "La contraseña debe tener al menos 8 caracteres, incluir al menos un número, una letra y un carácter especial.",
    });
  }
  const userOne = await User.findOne({ where: { correo } });
  
  if (userOne) {
    return res.status(400).json({
      message: `El usuario con el email: ${correo} ya existe`,
    });
  }
  const saltRounds = 10;
  const contrasenaHasheada = await bcrypt.hash(contrasena, saltRounds);

  try {
    const newUser = await User.create({
      correo,
      contrasena: contrasenaHasheada,
      nombre,
      rol,
    });
    return res.status(201).json({
      message: "Usuario creado correctamente",
      data: newUser,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error creando el usuario",
      error: err.message,
    });
  }
};

export const iniciarSesion = async (req: Request,res: Response): Promise<any> => {
  const { correo, contrasena } = req.body;
  
  // Busca por el correo encriptado
  const user = await User.findOne({ where: { correo: correo } });
  
  if (!user) {
    return res.status(400).json({
      message: "Usuario no encontrado",
    });
  }
  
  // Verifica la contraseña con bcrypt
  const contrasenaValida = await bcrypt.compare(contrasena, user.contrasena);
  
  if (!contrasenaValida) {
    return res.status(400).json({
      message: "Contraseña incorrecta",
    });
  }
  const token = jwt.sign(
    {
      Uid: user.Uid,
      correo: user.correo,
    },
    process.env.SECRET_KEY || "DxVj971V5CxBQGB7hDqwOenbRbbH4mrS",
    {
      expiresIn: "30m",
    }
  );
  res.json({
    msg: "Usuario logeado con éxito",
    Uid: user.Uid,
    correo: user.correo,
    nombre: user.nombre,
    rol: user.rol,
    token,
  });
};
export const reestablecerContraseña = async (req: Request,res: Response): Promise<any> => {
    const {correo, contrasena} = req.body;
    try {
        const user = await User.findOne({where:{correo}});
        if(!user){
            return res.status (400).json({msg:"El correo:"+correo+" no existe" })
        }
        const passwordRegex =/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(contrasena)) {
        return res.status(400).json({
          message:
            "La contraseña debe tener al menos 8 caracteres, incluir al menos un número, una letra y un carácter especial.",
        });
      }
       const hashedPassword = await bcrypt.hash(contrasena, 10);
       user.contrasena = hashedPassword
       await user.save();
         return res.status(200).json({msg:"Contraseña reestablecida con éxito"});
    }catch(err:any){
        return res.status(500).json({msg:"Error al reestablecer la contraseña", error:err.message});
    }
}

export const eliminarUsuarioId = async (req: Request,res: Response): Promise<any> => {
    const {Uid} = req.params;
    try {
        const user = await User.findByPk(Uid);
        if(!user){
            return res.status(400).json({msg:"El usuario no existe"});
        }
        await user.destroy();
        return res.status(200).json({msg:"Usuario eliminado con éxito"});
    }catch(err:any){
        return res.status(500).json({msg:"Error al eliminar el usuario", error:err.message});
    }
}


export const obtenerUsuarios = async (req: Request, res: Response): Promise<any> => {
  try {
    const usuarios = await User.findAll();
    return res.status(200).json({
      message: "Usuarios obtenidos con éxito",
      data: usuarios,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error al obtener los usuarios",
      error: err.message,
    });
  }
};