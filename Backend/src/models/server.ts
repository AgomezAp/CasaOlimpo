import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import * as path from 'path';
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
import RMensajeria from '../routes/mensajeria';
import { Agenda } from './agenda';
import { Carpeta } from './carpeta';
import { Consulta } from './consulta';
import { Descuento } from './descuento';
import { Factura } from './facturacion';
import { Receta } from './receta';
import { Paciente } from './paciente';
import { RedFamiliar } from './redfamiliar';
import { User } from './user';
import { rateLimiter } from '../controllers/rateLimiter';
import RAgendaNoRegistrados from '../routes/agendaNoRegistrados';
import { AgendaNoRegistrados } from './agendaNoRegistrados';
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
        this.app.use(RAgendaNoRegistrados);
        this.app.use(RMensajeria);
    }
    middlewares(){
        this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
        this.app.use(express.json())
        this.app.use(rateLimiter);
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
    }
    async DBconnect(){
        try{
            /* {force: true}{alter: true} */
            await sequelize.authenticate();
        // Primer nivel: tablas independientes
        await User.sync();
        await Paciente.sync();
        
        // Segundo nivel: tablas con dependencias simples
        await Consulta.sync();
        await RedFamiliar.sync();
        
        // Tercer nivel: tablas que dependen del segundo nivel
        await Carpeta.sync();
        await Agenda.sync();
        await AgendaNoRegistrados.sync();
        
        // Cuarto nivel: tablas con dependencias complejas
        await Receta.sync(); 
        await Factura.sync();
        await Descuento.sync();
        
            console.log('Conexión establecida correctamente');
        }catch (error){
            console.log("Error de conexion",error); 

        }
    }
}

export default Server;