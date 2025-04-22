import { Request, Response } from 'express';
import { Paciente } from '../models/paciente';
import { json, Op, Sequelize } from 'sequelize';
import schedule from 'node-schedule';

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
            sessionID: "1234",
            phoneNumberCliente,
            phoneNumberMaestro,
            nombreDelCliente,
            message
        })
    });
    if (!apiResponse.ok) {
        const errorResponse = await apiResponse.text();
        throw new Error('Error al enviar el mensaje.');
    }
    const apiResult = await apiResponse.json();

    const mensajeEnviado = {
        sessionID: "1234",
        to: phoneNumberCliente,
        from: phoneNumberMaestro,
        nombreDelCliente,
        message,
        status: 'Mensaje enviado correctamente'
    };
    return apiResult
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
    return clienteConMismaFecha
}

export let mensajeGuardado: {mensaje: any, hora: any};
export const obtenerMensaje = async (req: Request, res: Response): Promise<any> => {
    //Recibir cambio de mensaje
    try {
        const { mensaje, hora} = req.body;
        mensajeGuardado = {mensaje, hora}
        console.log(mensajeGuardado)
        return res.status(200).json({mensaje})
    } catch (error) {
        console.error('Error al programar la tarea:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

export const mensajeToFront = async (req: Request, res: Response): Promise<any> => {
    //mostrar mensaje en el front
    if (!mensajeGuardado || (mensajeGuardado.mensaje?.trim() === '' && mensajeGuardado.hora?.trim()=== '')) {
        mensajeGuardado = {
            mensaje: '¡Feliz cumpleaños! En Casa Olimpo, celebramos contigo este día especial. Que la luz de tu sonrisa brille aún más fuerte y que cada deseo de tu corazón se haga realidad. ¡Te enviamos un abrazo lleno de energía positiva!',
            hora: "10:00"
        }
    }
    console.log(mensajeGuardado)
    return res.status(200).json(mensajeGuardado);
}