import {
    DataTypes,
    Model,
} from 'sequelize';

import sequelize from '../database/connection';
import { User } from './user';
import { Paciente } from './paciente';

export class Consulta extends Model {
    public Uid!: number;
    public Cid!: number;
    public motivo!: string;
    public enfermedad_actual!: string;
    public objetivos_terapia!: string;
    public historia_problema!: string;
    public desarrollo!: string;
    public plan_terapeutico!: string;
    public tipo_diagnostico!: string;
    public analisis_diagnostico!: string;
    public plan_tratamiento!: string;
    public recomendaciones!: string;
    public numero_documento!: string;
    public fecha!: Date;
    public correo!: string;
    public consentimiento_info !: Blob;
    public consentimiento_check !: boolean;
    public abierto !: boolean;
}

Consulta.init(
    {
        Uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'Uid'
            }
        },
        Cid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        motivo: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        enfermedad_actual: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        objetivos_terapia: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        historia_problema: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        desarrollo: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        plan_terapeutico: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        tipo_diagnostico: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        analisis_diagnostico: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        plan_tratamiento: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        recomendaciones: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        },
        numero_documento: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Paciente',
                key: 'numero_documento'
            },
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'User',
                key: 'correo'
            },
        },
        consentimiento_info: {
            type: DataTypes.BLOB('long'),
            allowNull: true,
        },
        consentimiento_check: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        abierto: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Consulta",
        timestamps: false,
    }
);

Consulta.belongsTo(User, {
    foreignKey: 'Uid', // This is the column in Consulta that references User
    targetKey: 'Uid',  // This is the column in User that is being referenced
    as: 'doctor'       // This is the alias for the relationship
  });
  
  // Define the relationship between Consulta and Paciente
  Consulta.belongsTo(Paciente, {
    foreignKey: 'numero_documento', // This is the column in Consulta that references Paciente
    targetKey: 'numero_documento',  // This is the column in Paciente that is being referenced
    as: 'paciente'                  // This is the alias for the relationship
  });
  
  // Define the reverse relationships
  User.hasMany(Consulta, {
    foreignKey: 'Uid',
    as: 'consultas'
  });
  
  Paciente.hasMany(Consulta, {
    foreignKey: 'numero_documento',
    as: 'consultas'
  });