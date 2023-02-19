import { model, Schema, Document } from "mongoose"

export interface HoursInterface extends Document {
    activity_name: String,
    hours: Number,
    assignation_date: Date,
    responsible_register: String
}

export interface CardInterface extends Document {
    provider_register: String,
    activities: HoursInterface
}

const ActivitySchema = new Schema({
    activity_name: {
        type: String,
        lowercase: true,
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
    }
})

const CardSchema = new Schema({
    provider_register: {
        type: String,
        unique: true,
        index: true,
        required: [true, "El registro del prestador es necesario"]
    },
    activities: [ActivitySchema]
}, {
    versionKey: false,
    timestamps: true
})

const Card = model<CardInterface>("Cards", CardSchema)

export default Card