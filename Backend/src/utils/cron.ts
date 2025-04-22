import cron from 'node-cron';
import { funObtenerFecha, enviarMensaje, funEnviarMensaje } from '../controllers/mensajeria';
import { mensajeGuardado } from '../controllers/mensajeria';
const PHONE_MASTER = '' 
const mensaje = typeof mensajeGuardado === 'string' ? JSON.parse(mensajeGuardado) : mensajeGuardado;
const [hora, minuto] = mensaje.hora.split(':').map(Number);
const exCron = `${minuto} ${hora} * * *`
console.log(mensaje)
cron.schedule(exCron, async () => {
    try {
        const pacientes = await funObtenerFecha()
        if(pacientes.length == 0) {
            console.log("No hay pacientes");
            return;
        }
        const mensaje = mensajeGuardado.mensaje
        for (const paciente of pacientes) {
            try {
                await funEnviarMensaje(paciente.telefono, PHONE_MASTER, paciente.nombre, mensaje)
            } catch (error) {
                console.error('Error al enviar mensaje')
            }
        }
    } catch(error) {
        console.error('Error al ejecutar la tarea de quitar tiempo automaticamente', error)
    }
})