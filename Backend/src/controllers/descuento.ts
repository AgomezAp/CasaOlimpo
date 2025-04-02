import { Paciente } from '../models/paciente';

export const enviarDescuento = async (req: Request, res: Response): Promise<any> => {
    try {
        // const { mensaje } = req.body;
        const numeros = await Paciente.findAll({
            attributes: ['nombre', 'apellidos', 'celular']
        });
        for (const num of numeros){
            const newBody = JSON.stringify({
                sessionId: "1234",
                phoneNumberCliente: '',
                phoneNumberMaestro: `57${num.celular}`, //numero que va a recibir el mensaje
                nombreDelCliente: `${num.nombre} ${num.apellidos}`, 
                message : `${num.nombre}`
            })
            const message = await fetch('https://gestor-de-mesajeria-via-whatsapp-g5hc.onrender.com/api/message/CrearMensaje', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: newBody
            }); 
        }
    }
    catch (error) {
    }
}