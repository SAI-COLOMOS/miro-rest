import { model, Schema, Document } from "mongoose"

export interface AreaInterface extends Document {
    area_identifier: string
    area_name: string
}

export interface PlaceInterface extends Document {
    place_identifier: string
    place_name: string
    place_areas: AreaInterface
}

const AreaSchema = new Schema({
    area_identifier: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    area_name: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        index: true
    },
}, {
    versionKey: false
})

const PlaceSchema = new Schema({
    place_identifier: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    place_name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    place_areas: {
        type: [AreaSchema]
    }
}, {
    versionKey: false,
    timestamps: true
})

export default model<PlaceInterface>("Places", PlaceSchema)