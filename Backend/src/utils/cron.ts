import cron from 'node-cron';
import { funObtenerFecha, funObtenerMensaje, funEnviarMensaje } from '../controllers/mensajeria';
import { mensajeGuardado } from '../controllers/mensajeria';
import { decryptData } from '../controllers/encriptado';
const PHONE_MASTER = '' 
// const [hora, minuto] = mensaje.hora.split(':').map(Number);
// const exCron = `${minuto} ${hora} * * *`
// cron.schedule('* * * * *', async() => {
//     try {
//         const mensaje = await funObtenerMensaje()
//     } catch (error) {
        
//     }
//     timezone: "America/Bogota"
// })
cron.schedule(`0 10 * * *`, async () => {
    console.log("tareaejecutandose")
    const mensaje = typeof mensajeGuardado === 'string' ? JSON.parse(mensajeGuardado) : mensajeGuardado;
    try {
        const pacientes = await funObtenerFecha()
        if(pacientes.length == 0) {
            console.log("No hay pacientes");
            return;
        }
        console.log(pacientes)
        for (const paciente of pacientes) {
            try {
                console.log(PHONE_MASTER, decryptData(paciente.telefono),  decryptData(paciente.nombre), mensaje)
                await funEnviarMensaje(PHONE_MASTER, decryptData(paciente.telefono), decryptData(paciente.nombre), mensaje)
            } catch (error) {
                console.error('Error al enviar mensaje')
            }
        }
    } catch(error) {
        console.error('Error al ejecutar la tarea', error)
    }
    timezone: "America/Bogota"
})