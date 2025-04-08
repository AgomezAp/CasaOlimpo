"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const connection_1 = __importDefault(require("../database/connection"));
const agenda_1 = __importDefault(require("../routes/agenda"));
const carpeta_1 = __importDefault(require("../routes/carpeta"));
const consulta_1 = __importDefault(require("../routes/consulta"));
const descuento_1 = __importDefault(require("../routes/descuento"));
const facturacion_1 = __importDefault(require("../routes/facturacion"));
const paciente_1 = __importDefault(require("../routes/paciente"));
const receta_1 = __importDefault(require("../routes/receta"));
const redfamiliar_1 = __importDefault(require("../routes/redfamiliar"));
const user_1 = __importDefault(require("../routes/user"));
const mensajeria_1 = __importDefault(require("../routes/mensajeria"));
const agenda_2 = require("./agenda");
const carpeta_2 = require("./carpeta");
const consulta_2 = require("./consulta");
const descuento_2 = require("./descuento");
const facturacion_2 = require("./facturacion");
const receta_2 = require("./receta");
const paciente_2 = require("./paciente");
const redfamiliar_2 = require("./redfamiliar");
const user_2 = require("./user");
const rateLimiter_1 = require("../controllers/rateLimiter");
const agendaNoRegistrados_1 = __importDefault(require("../routes/agendaNoRegistrados"));
const agendaNoRegistrados_2 = require("./agendaNoRegistrados");
dotenv_1.default.config();
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT;
        this.middlewares();
        this.router();
        this.DBconnect();
        this.listen();
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log("Server running on port: " + this.port);
        });
    }
    router() {
        this.app.use(agenda_1.default);
        this.app.use(carpeta_1.default);
        this.app.use(consulta_1.default);
        this.app.use(descuento_1.default);
        this.app.use(facturacion_1.default);
        this.app.use(paciente_1.default);
        this.app.use(receta_1.default);
        this.app.use(redfamiliar_1.default);
        this.app.use(user_1.default);
        this.app.use(agendaNoRegistrados_1.default);
        this.app.use(mensajeria_1.default);
    }
    middlewares() {
        this.app.use('/uploads', express_1.default.static(path.join(__dirname, '../../uploads')));
        this.app.use(express_1.default.json());
        this.app.use(rateLimiter_1.rateLimiter);
        this.app.use((0, cors_1.default)({
            origin: '*', // Permite todas las solicitudes de origen cruzado
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos permitidos
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
    }
    DBconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /* {force: true}{alter: true} */
                yield connection_1.default.authenticate();
                // Primer nivel: tablas independientes
                yield user_2.User.sync();
                yield paciente_2.Paciente.sync();
                // Segundo nivel: tablas con dependencias simples
                yield consulta_2.Consulta.sync({ alter: true });
                yield redfamiliar_2.RedFamiliar.sync();
                // Tercer nivel: tablas que dependen del segundo nivel
                yield carpeta_2.Carpeta.sync();
                yield agenda_2.Agenda.sync();
                yield agendaNoRegistrados_2.AgendaNoRegistrados.sync();
                // Cuarto nivel: tablas con dependencias complejas
                yield receta_2.Receta.sync();
                yield facturacion_2.Factura.sync();
                yield descuento_2.Descuento.sync();
                console.log('Conexión establecida correctamente');
            }
            catch (error) {
                console.log("Error de conexion", error);
            }
        });
    }
}
exports.default = Server;
