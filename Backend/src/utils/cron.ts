import cron from 'node-cron';
import { funObtenerFecha, funObtenerMensaje, funEnviarMensaje } from '../controllers/mensajeria';
import { mensajeGuardado } from '../controllers/mensajeria';
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
                console.log(paciente.telefono, PHONE_MASTER, paciente.nombre, mensaje)
                await funEnviarMensaje(paciente.telefono, PHONE_MASTER, paciente.nombre, mensaje)
            } catch (error) {
                console.error('Error al enviar mensaje')
            }
        }
    } catch(error) {
        console.error('Error al ejecutar la tarea', error)
    }
    timezone: "America/Bogota"
})