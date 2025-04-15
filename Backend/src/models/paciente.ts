import {
  DataTypes,
  Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { Receta } from './receta';
import { User } from './user';

export class Paciente extends Model {
    public Pid !: number;
    public Uid !: number;
    public nombre !: string;
    public apellidos !: string;
    public fecha_nacimiento !: Date;
    public sexo !: 'Masculino' | 'Femenino' | 'Otro';
    public ciudad_nacimiento !: string;
    public edad !: string;
    public tipo_documento !: 'Cedula' | 'Tarjeta de identidad' | 'Cedula de extranjeria' | 'Pasaporte';
    public numero_documento !: string;  
    public ciudad_expedicion !: string;
    public ciudad_domicilio !: string;
    public barrio !: string;
    public direccion_domicilio !: string;
    public telefono !: string;  
    public email !: string;
    public celular !: string;
    public ocupacion !: string;
    public estado_civil !: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo'|'Union libre';
    public eps !: string;
    public tipo_afiliacion !: 'Contributivo' | 'Subsidiado' | 'Vinculado' | 'Particular';
    public grupo_sanguineo !: 'A' |'B' | 'AB' |'O';
    public rh !: '+' | '-';
    public alergias !: string;
    public antecedentes !: string;
    public antecedentes_familiares !: string;
    public foto_path!: string;
    public doctor_anterior?: number;
    public fecha_transferencia?: Date;
}

Paciente.init(
    {
        Pid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            
        },
        Uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'Uid'
            }
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        apellidos: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha_nacimiento: {
            type: DataTypes.DATE,
            allowNull: true,
           
        },
        sexo: {
            type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro'),
            allowNull: false
        },
        ciudad_nacimiento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        edad: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tipo_documento: {
            type: DataTypes.ENUM('Cedula', 'Tarjeta de identidad', 'Cedula de extranjeria', 'Pasaporte','Otro'),
            allowNull: false
        },
        numero_documento: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true

        },
        ciudad_expedicion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ciudad_domicilio: {
            type: DataTypes.STRING,
            allowNull: false
        },
        barrio: {
            type: DataTypes.STRING,
            allowNull: false
        },
        direccion_domicilio: {
            type: DataTypes.STRING,
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        celular: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ocupacion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        estado_civil: {
            type: DataTypes.ENUM('Soltero', 'Casado', 'Divorciado', 'Viudo', 'Union libre'),
            allowNull: false
        },
        eps: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tipo_afiliacion: {
            type: DataTypes.ENUM('Contributivo', 'Subsidiado', 'Vinculado', 'Particular'),
            allowNull: false
        },
        grupo_sanguineo: {
            type: DataTypes.ENUM('A', 'B', 'AB', 'O'),
            allowNull: true
          
        },
        rh: {
            type:
                DataTypes.ENUM('+', '-'),
            allowNull: false
        },
        alergias: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        antecedentes: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        antecedentes_familiares: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        foto_path: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        doctor_anterior: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: 'User',
              key: 'Uid'
            }
          },
          fecha_transferencia: {
            type: DataTypes.DATE,
            allowNull: true
          }
        
    },
        {
            sequelize,
            tableName: "Paciente",
            timestamps: false,
        }

);


Paciente.belongsTo(User, { 
    foreignKey: 'Uid', 
    as: 'doctor' 
  });
  
  // Asociación inversa: Un doctor puede tener muchos pacientes
  User.hasMany(Paciente, { 
    foreignKey: 'Uid', 
    as: 'pacientes' 
  });