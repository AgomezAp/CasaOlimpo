import cron from 'node-cron';

cron.schedule('0 2 1 * *', async () => {
    try {
        console.log("Tiempo restado automaticamente")
    } catch(error) {
        console.error('Error al ejecutar la tarea de quitar tiempo automaticamente', error)
    }
})