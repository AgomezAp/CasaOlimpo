import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';

import sequelize from '../database/connection';
import RAgenda from '../routes/agenda';
import RCarpeta from '../routes/carpeta';
import Rconsulta from '../routes/consulta';
import Rdescuento from '../routes/descuento';
import RFacturacion from '../routes/facturacion';
import RPaciente from '../routes/paciente';
import RReceta from '../routes/receta';
import RRedFamiliar from '../routes/redfamiliar';
import RUser from '../routes/user';

dotenv.config();


class Server{

    private app: Application;
    private port?: string;
    constructor(){
        this.app = express();
        this.port = process.env.PORT;
        this.middlewares();
        this.router();
        this.DBconnect();
        this.listen();
    }
    listen (){
        this.app.listen(this.port, () => {
            console.log("Server running on port: " + this.port);
        });
    }
    router(){
      
        this.app.use(RAgenda)
        this.app.use(RCarpeta);
        this.app.use(Rconsulta)
        this.app.use(Rdescuento)
        this.app.use(RFacturacion)
        this.app.use(RPaciente);
        this.app.use(RReceta);
        this.app.use(RRedFamiliar);
        this.app.use(RUser)
    }
    middlewares(){
        this.app.use(express.json())
        this.app.use(cors({
            origin: '*', // Permite todas las solicitudes de origen cruzado
            methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Métodos permitidos
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
    }
    async DBconnect(){
        try{
            /* {force: true}{alter: true} */
            await sequelize.authenticate();
            

            /* await Agenda.sync({alter: true});
            await Role.sync();
            await Area.sync({alter: true});
            await User.sync();
            await Product.sync();
            await Permiso.sync({alter: true});
            await Registro.sync({force: true});
            await Sumatoria.sync({force: true});
            await Novedad.sync({alter: true});
            await NovedadHistorico.sync({alter: true});

 */
            console.log('Conexión establecida correctamente');
        }catch (error){
            console.log("Error de conexion"); 

        }
    }
}

export default Server;