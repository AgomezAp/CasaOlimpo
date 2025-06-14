import { Request, Response } from 'express';
import { Paciente } from '../models/paciente';
import { json, Op, Sequelize } from 'sequelize';
import schedule from 'node-schedule';
import {decryptData} from '../controllers/encriptado';






export const enviarMensaje = async (req: Request, res: Response): Promise<any> => {
    try {
        const {  phoneNumberCliente, phoneNumberMaestro, nombreDelCliente, message } = req.body;
        // Validar que todos los campos requeridos estén presentes
        if (!phoneNumberCliente || !phoneNumberMaestro || !nombreDelCliente || !message) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }
        const mensajeEnviado = await funEnviarMensaje(phoneNumberCliente, phoneNumberMaestro, nombreDelCliente, message);
        return res.status(200).json(mensajeEnviado);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const funEnviarMensaje = async(phoneNumberCliente: string, phoneNumberMaestro: string, nombreDelCliente: string, message: string): Promise<any> => {
    const apiResponse = await fetch(`${process.env.SERVER_MENSAJERIA}/api/messages/CrearMensaje`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': '181.129.218.198'
        },
        body: JSON.stringify({
            sessionId: '1234',
            phoneNumberCliente,
            phoneNumberMaestro,
            nombreDelCliente,
            message
        })
    });
    console.log(apiResponse)
    if (!apiResponse.ok) {
        const errorResponse = await apiResponse.text();
        throw new Error('Error al enviar el mensaje.');
    }
    const apiResult = await apiResponse.json();

    const mensajeEnviado = {
        sessionId: "1234",
        to: phoneNumberCliente,
        from: phoneNumberMaestro,
        nombreDelCliente,
        message,
        status: 'Mensaje enviado correctamente'
    };
    return apiResult
}

export const verificarSesion = async (req: Request, res: Response): Promise<any> => {
    try {
        const [existe, sesion] = await funVerificarSesion()
        if (existe){
            return res.status(200).json({mensaje :'si', sesion: sesion} )
        } else {
            return res.status(404).json({mensaje: 'No hay  ninguna sesion activa'})
        }
        
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const funVerificarSesion = async (): Promise<any> => {
    const apiResponse = await fetch(`${process.env.SERVER_MENSAJERIA}/api/whatsapp/ObtenerClientes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Origin': '181.129.218.198'
        }
    })
    console.log(apiResponse)
    const sesion = await apiResponse.json()
    let existe: boolean;
    if (!sesion.clients || Object.keys(sesion.clients).length === 0) {
        existe = false
    } else {
        existe = true
    }
    const total = [existe, sesion.clients]
    return total;
}


export const obtenerFecha = async (req: Request,res: Response): Promise<any> => {
    try {
        const pacientes = await funObtenerFecha();
        if (pacientes.length > 0) {
            return res.status(200).json({pacientes: pacientes });
        }
        return res.status(200).json({message: 'No hay pacientes cumpliendo años hoy.' });
    } catch (error) {
        console.error('Error al obtener la fecha:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const funObtenerFecha = async (): Promise<any[]> => {
    const fechaActual = new Date();
    const mes = (fechaActual.getMonth()+1).toString().padStart(2, '0');
    const dia = (fechaActual.getDate().toString().padStart(2,'0'));

    const clienteConMismaFecha = await Paciente.findAll({
        where: Sequelize.where(
            Sequelize.fn('TO_CHAR', Sequelize.col('fecha_nacimiento'), 'MM-DD'),
            `${mes}-${dia}`
        )
    });
    const pacientesDesencriptados = clienteConMismaFecha.map((paciente: any) => ({
        ...paciente.toJSON(),
        nombre: decryptData(paciente.nombre),
        apellidos: decryptData(paciente.apellidos),
        edad: decryptData(paciente.edad)
    }));
    return pacientesDesencriptados;
}

export let mensajeGuardado: {mensaje: any} = {
    mensaje: '¡Feliz cumpleaños! En Casa Olimpo, celebramos contigo este día especial. Que la luz de tu sonrisa brille aún más fuerte y que cada deseo de tu corazón se haga realidad. ¡Te enviamos un abrazo lleno de energía positiva!'
};
export const obtenerMensaje = async (req: Request, res: Response): Promise<any> => {
    //Recibir cambio de mensaje
    try {
        const { mensaje} = req.body;
        if (!mensaje) {
            return res.status(400).json({error: 'Todso los campos son obligatorios'})
        }
        const resultado = await funObtenerMensaje(mensaje)
        console.log(mensajeGuardado)
        return res.status(200).json(resultado)
    } catch (error) {
        console.error('Error al programar la tarea:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const funObtenerMensaje = async (mensaje: string): Promise<{mensaje: string }> => {
    try {
        mensajeGuardado = {mensaje};
        return mensajeGuardado;
    } catch (error) {
        console.error('Error al guardar el mensaje', error)
        throw new Error('Error al guardar el mensaje')
    }
}

export const mensajeToFront = async (req: Request, res: Response): Promise<any> => {
    //mostrar mensaje en el front
    if (!mensajeGuardado || (mensajeGuardado.mensaje?.trim() === '')) {
        mensajeGuardado
    }
    console.log(mensajeGuardado)
    return res.status(200).json(mensajeGuardado);
}