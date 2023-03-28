import { model, Schema, Document } from "mongoose"

export interface HoursInterface extends Document {
  activity_name: string
  hours: number
  assignation_date: Date
  responsible_register: string
  responsible_name: string
}

export interface CardInterface extends Document {
  provider_register: string
  achieved_hours: number
  total_hours: number
  activities: HoursInterface[]
}

const ActivitySchema = new Schema({
  activity_name: {
    type: String,
    required: [true, "El nombre de la actividad es necesario"]
  },
  hours: {
    type: Number,
    required: [true, "La cantidad de horas son necesarias es necesario"]
  },
  assignation_date: {
    type: Date,
    default: new Date().toISOString()
  },
  responsible_register: {
    type: String,
    required: [true, "El registro del encargado es necesario"]
  },
  responsible_name: {
    type: String,
    required: [true, "El nombre del encargado es necesario"]
  }
}, {
  versionKey: false,
  timestamps: true
})

const CardSchema = new Schema({
  provider_register: {
    type: String,
    unique: true,
    index: true,
    required: [true, "El registro del prestador es necesario"]
  },
  total_hours: {
    type: Number,
    required: [true, "La cantidad de horas totales es obligatoria"]
  },
  achieved_hours: {
    type: Number,
    default: 0
  },
  activities: [ActivitySchema]
}, {
  versionKey: false,
  timestamps: true
})

const Card = model<CardInterface>("Cards", CardSchema)

export default Card