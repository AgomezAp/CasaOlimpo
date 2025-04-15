import { DataTypes, Model } from "sequelize";

import sequelize from "../database/connection";
import { User } from "./user";
import { Paciente } from "./paciente";

export class Agenda extends Model {
  public Aid!: number;
  public correo!: string;
  public fecha_cita!: Date;
  public hora_cita!: string;
  public estado!: "Confirmada" | "Cancelada" | "Programada";
  public numero_documento!: string;
  public descripcion!: string;
  public duracion!: number;
}
Agenda.init(
  {
    Aid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "User",
        key: "correo",
      },
    },
    numero_documento: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Paciente",
        key: "numero_documento",
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
    estado: {
      type: DataTypes.ENUM("Confirmada", "Cancelada", "Programada"),
      defaultValue: "Pendiente",
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Agenda",
    timestamps: false,
  }
);
Agenda.belongsTo(User, {
  foreignKey: "correo",
  targetKey: "correo",
  as: "doctor",
});
User.hasMany(Agenda, {
  foreignKey: "correo",
  sourceKey: "correo",
  as: "citas",
});
Agenda.belongsTo(Paciente, {
  foreignKey: "numero_documento",
  targetKey: "numero_documento",
  as: "paciente",
});
Paciente.hasMany(Agenda, {
  foreignKey: "numero_documento",
  sourceKey: "numero_documento",
  as: "citas",
});
