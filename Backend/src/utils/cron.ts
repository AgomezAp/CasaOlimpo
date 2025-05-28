import cron from 'node-cron';
import { funObtenerFecha, funObtenerMensaje, funEnviarMensaje } from '../controllers/mensajeria';
import { mensajeGuardado } from '../controllers/mensajeria';
import { decryptData } from '../controllers/encriptado';
const PHONE_MASTER = '' 
const mensaje = typeof mensajeGuardado === 'string' ? JSON.parse(mensajeGuardado) : mensajeGuardado;
// const [hora, minuto] = mensaje.hora.split(':').map(Number);
// const exCron = `${minuto} ${hora} * * *`
console.log(mensaje)
// cron.schedule('* * * * *', async() => {
//     try {
//         const mensaje = await funObtenerMensaje()
//     } catch (error) {
        
//     }
//     timezone: "America/Bogota"
// })
let [hora, minuto] = mensaje.hora.split(':').map(Number);
console.log(hora, minuto)
cron.schedule(`${minuto} ${hora} * * *`, async () => {
    console.log("tareaejecutandose")
    try {
        const pacientes = await funObtenerFecha()
        if(pacientes.length == 0) {
            console.log("No hay pacientes");
            return;
        }
        console.log(pacientes)
        const mensaje = mensajeGuardado.mensaje
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