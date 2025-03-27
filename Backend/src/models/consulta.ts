import {
    DataTypes,
    Model,
} from 'sequelize';

import sequelize from '../database/connection';

export class Consulta extends Model {
    public Cid!: number;
    public Motivo!: string;
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
    public Uid!: number;
}

Consulta.init(
    {
        Cid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        Motivo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        enfermedad_actual: {
            type: DataTypes.STRING,
            allowNull: false
        },
        objetivos_terapia: {
            type: DataTypes.STRING,
            allowNull: false
        },
        historia_problema: {
            type: DataTypes.STRING,
            allowNull: false
        },
        desarrollo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        plan_terapeutico: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tipo_diagnostico: {
            type: DataTypes.STRING,
            allowNull: false
        },
        analisis_diagnostico: {
            type: DataTypes.STRING,
            allowNull: false
        },
        plan_tratamiento: {
            type: DataTypes.STRING,
            allowNull: false
        },
        recomendaciones: {
            type: DataTypes.STRING,
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
        Uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'numero_documento'
            },
        }
    },
    {
        sequelize,
        tableName: "Consulta",
        timestamps: false,
    }
)