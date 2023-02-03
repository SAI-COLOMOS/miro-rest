import { model, Schema, Document } from "mongoose"

export interface HoursInterface extends Document {
    activity_name: String,
    hours: Number,
    assignation_date: Date,
    assignation_hour: Date,
    responsible_register: String
}

export interface CardInterface extends Document {
    provider_register: String,
    hours: HoursInterface
}

const HoursSchema = new Schema({
    activity_name: {
        type: String,
    },
    hours: {
        type: Number,
        required: [true, "La cantidad de horas son necesarias es necesario"]
    },
    assignation_date: {
        type: Date,
        default: Date.now
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
        required: [true, "El registro del prestador es necesario"]
    },
    hours: [HoursSchema]
}, {
    versionKey: false,
    timestamps: true
})

const Card = model<CardInterface>("Cards", CardSchema)
export const Hours = model<HoursInterface>("Hours", HoursSchema)

export default Card