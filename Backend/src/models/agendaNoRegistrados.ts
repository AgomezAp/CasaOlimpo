import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";
import { User } from "./user";

export class AgendaNoRegistrados extends Model {
  public ANRid!: number;
  public nombre!: string;
  public apellidos!: string;
  public fecha_cita!: Date;
  public hora_cita!: string;
  public telefono!: string;
  public estado!: "Confirmada" | "Cancelada" | "Programada";
  public correo!: string;
  public duracion!: number;
  public descripcion!: string;
}

AgendaNoRegistrados.init(
  {
    ANRid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "User",
        key: "correo",
      },
    },

    fecha_cita: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_cita: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("Confirmada", "Cancelada", "Programada","Pendiente"),
      defaultValue: "Pendiente",
      allowNull: false,
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
        allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "AgendaNoRegistrados",
    timestamps: false,
  }
);
AgendaNoRegistrados.belongsTo(User, {
  foreignKey: "correo",
  targetKey: "correo",
});
User.hasOne(AgendaNoRegistrados, { foreignKey: "correo", as: "Agenda" });
